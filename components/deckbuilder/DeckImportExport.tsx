import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { theme } from "@/style/ui/Theme";
import { orderCardsInDeck } from "@/helpers/orderCardsInDeck";

interface DeckImportExportProps {
  deck: any;
  cardDb: any;
  db: any;
  getCardsArray: () => any[];
  setDeck: (deck: any) => void;
  decksVersion?: number;
  deckId: string | number;
}

const DeckImportExport: React.FC<DeckImportExportProps & { incrementDecksVersion?: () => void }> = ({
  deck,
  cardDb,
  db,
  getCardsArray,
  setDeck,
  decksVersion,
  deckId,
  incrementDecksVersion,
}) => {
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  // Export deck to txt file
  const handleExportDeck = async () => {
    if (!deck || !cardDb) return;
    const cardsArr = getCardsArray();
    if (!cardsArr.length) return;
    // Get all cardIds
    const ids = cardsArr.map((c: any) => c.cardId).filter(Boolean);
    if (!ids.length) return;
    const placeholders = ids.map(() => "?").join(", ");
    // Fetch all needed info in one query (join Card and CardSet)
    const cardRows = await cardDb.getAllAsync(
      `SELECT Card.cardId, Card.name, Card.supertype, Card.number, Card.setId, Card.subtypes, Card.evolvesFrom, Card.evolvesTo, CardSet.ptcgoCode
       FROM Card
       LEFT JOIN CardSet ON Card.setId = CardSet.id
       WHERE Card.cardId IN (${placeholders})`,
      ids
    );
    // Build a map for quick lookup
    const cardMap: Record<string, any> = {};
    for (const row of cardRows) {
      cardMap[row.cardId] = row;
    }
    // Build cardDataMap for orderCardsInDeck
    const cardDataMap: Record<string, { name: string; supertype: string; subtypes: string[] }> = {};
    // Build cardDbMap for evolution info
    const cardDbMap: Record<string, { evolvesFrom?: string; evolvesTo?: string | string[] }> = {};
    for (const row of cardRows) {
      let subtypes: string[] = [];
      if (Array.isArray(row.subtypes)) subtypes = row.subtypes;
      else if (typeof row.subtypes === "string") {
        try {
          const arr = JSON.parse(row.subtypes);
          if (Array.isArray(arr)) subtypes = arr;
          else if (arr) subtypes = [arr];
        } catch {
          if (row.subtypes && row.subtypes.trim() !== "") subtypes = [row.subtypes];
        }
      }
      cardDataMap[row.cardId] = {
        name: row.name,
        supertype: row.supertype,
        subtypes,
      };
      cardDbMap[row.cardId] = {
        evolvesFrom: row.evolvesFrom,
        evolvesTo: row.evolvesTo,
      };
    }
    // Use orderCardsInDeck to group/sort with evolution info
    const grouped = orderCardsInDeck(cardsArr, cardDataMap, cardDbMap);
    // Export in grouped order
    const pokemon: string[] = [];
    const trainer: string[] = [];
    const energy: string[] = [];
    let pokemonCount = 0;
    let trainerCount = 0;
    let energyCount = 0;
    for (const c of grouped.Pokémon) {
      const card = cardMap[c.cardId];
      if (!card) continue;
      const name = card.name || c.cardId;
      const quantity = c.quantity || 1;
      const ptcgoCode = card.ptcgoCode || "";
      const number = card.number || "";
      const line = `${quantity} ${name} ${ptcgoCode} ${number}`;
      pokemon.push(line);
      pokemonCount += quantity;
    }
    for (const c of grouped.Trainer) {
      const card = cardMap[c.cardId];
      if (!card) continue;
      const name = card.name || c.cardId;
      const quantity = c.quantity || 1;
      const ptcgoCode = card.ptcgoCode || "";
      const number = card.number || "";
      const line = `${quantity} ${name} ${ptcgoCode} ${number}`;
      trainer.push(line);
      trainerCount += quantity;
    }
    for (const c of grouped.Energy) {
      const card = cardMap[c.cardId];
      if (!card) continue;
      const name = card.name || c.cardId;
      const quantity = c.quantity || 1;
      const ptcgoCode = card.ptcgoCode || "";
      const number = card.number || "";
      const line = `${quantity} ${name} ${ptcgoCode} ${number}`;
      energy.push(line);
      energyCount += quantity;
    }
    // No deck name, just the groups
    let deckText = "";
    deckText += `Pokémon: ${pokemonCount}\n`;
    deckText += pokemon.join("\n") + (pokemon.length ? "\n\n" : "");
    deckText += `Trainer: ${trainerCount}\n`;
    deckText += trainer.join("\n") + (trainer.length ? "\n\n" : "");
    deckText += `Energy: ${energyCount}\n`;
    deckText += energy.join("\n") + (energy.length ? "\n" : "");
    const fileUri = FileSystem.cacheDirectory + `${deck.name || "deck"}.txt`;
    await FileSystem.writeAsStringAsync(fileUri, deckText, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri, { mimeType: "text/plain", dialogTitle: "Export Deck" });
  };

  // Import deck from txt file
  const handleImportDeck = async () => {
    if (!importText.trim() || !cardDb) return;
    setImporting(true);
    try {
      const lines = importText.split("\n").filter(Boolean);
      const newCardsArr: any[] = [];
      let currentGroup: "Pokémon" | "Trainer" | "Energy" | null = null;
      for (const line of lines) {
        if (/^Pok[ée]mon:/i.test(line)) {
          currentGroup = "Pokémon";
          continue;
        } else if (/^Trainer:/i.test(line)) {
          currentGroup = "Trainer";
          continue;
        } else if (/^Energy:/i.test(line)) {
          currentGroup = "Energy";
          continue;
        }
        if (!currentGroup) continue;
        // Robustly parse: <qty> <name...> <ptcgoCode> <number>
        const m = line.match(/^(\d+)\s+(.+?)\s+([A-Z0-9\-]+)\s+(\d+)$/);
        if (!m) continue;
        const [, quantityStr, name, ptcgoCode, number] = m;
        const quantity = parseInt(quantityStr, 10);
        let cardId: string | null = null;
        if (currentGroup === "Energy" && /basic/i.test(name)) {
          // Special case: Basic Energy, match by name, subtypes, set code, and number
          const dbEnergyName = name.trim();
          const rows = await cardDb.getAllAsync(
            `SELECT cardId FROM Card WHERE supertype = 'Energy' AND subtypes LIKE '%Basic%' AND name = ? AND setId IN (SELECT id FROM CardSet WHERE ptcgoCode = ?) AND number = ?`,
            [dbEnergyName, ptcgoCode, number]
          );
          if (rows && rows.length > 0) {
            cardId = rows[0].cardId;
          }
        } else {
          // Normal card: match by set code and number
          const setRows = await cardDb.getAllAsync(`SELECT id FROM CardSet WHERE ptcgoCode = ?`, [ptcgoCode]);
          if (setRows && setRows.length > 0) {
            const setId = setRows[0].id;
            const cardRows = await cardDb.getAllAsync(`SELECT cardId FROM Card WHERE setId = ? AND number = ?`, [
              setId,
              number,
            ]);
            if (cardRows && cardRows.length > 0) {
              cardId = cardRows[0].cardId;
            }
          }
        }
        if (cardId) {
          newCardsArr.push({ cardId, quantity });
        }
      }
      // Replace deck cards with imported cards
      setDeck((prevDeck: any) => ({
        ...prevDeck,
        cards: newCardsArr,
      }));
      if (db && deckId) {
        await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(newCardsArr), Number(deckId)]);
      }
      if (incrementDecksVersion) incrementDecksVersion();
    } catch (e) {
      console.error(e);
    }
    setImporting(false);
    setImportText("");
    setImportModalVisible(false);
  };

  return (
    <>
      <ThemedButton
        title="Export Deck"
        type="main"
        size="small"
        onPress={handleExportDeck}
        style={{ marginHorizontal: theme.padding.xsmall, marginBottom: theme.padding.medium }}
      />
      <ThemedButton
        title="Import Deck"
        type="main"
        size="small"
        onPress={() => setImportModalVisible(true)}
        style={{ marginHorizontal: theme.padding.xsmall, marginBottom: theme.padding.medium }}
      />
      <ThemedModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onConfirm={handleImportDeck}
        buttonText={importing ? "Importing..." : "Import"}
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setImportModalVisible(false)}
        disabled={importing}
      >
        <ThemedText
          type="h2"
          color={theme.colors.white}
          style={{ marginTop: theme.padding.small, marginBottom: theme.padding.medium, textAlign: "center" }}
        >
          Import Deck
        </ThemedText>
        <ThemedTextInput
          value={importText}
          onChange={setImportText}
          placeholder="Paste deck text here"
          multiline={20}
        />
      </ThemedModal>
    </>
  );
};

export default DeckImportExport;
