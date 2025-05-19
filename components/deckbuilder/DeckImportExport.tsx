import React, { useState } from "react";
import { View, Dimensions, ActivityIndicator } from "react-native";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { theme } from "@/style/ui/Theme";

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
      `SELECT Card.cardId, Card.name, Card.supertype, Card.number, Card.setId, Card.subtypes, CardSet.ptcgoCode
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
    // Group cards by supertype
    const pokemon: string[] = [];
    const trainer: string[] = [];
    const energy: string[] = [];
    let pokemonCount = 0;
    let trainerCount = 0;
    let energyCount = 0;
    for (const c of cardsArr) {
      const card = cardMap[c.cardId];
      if (!card) continue;
      const name = card.name || c.cardId;
      const supertype = card.supertype || "";
      const quantity = c.quantity || 1;
      const ptcgoCode = card.ptcgoCode || "";
      const number = card.number || "";
      // For basic energy, use correct name and set code
      let line = "";
      if (supertype === "Energy") {
        // Try to parse subtypes for 'Basic'
        let isBasic = false;
        if (card.subtypes) {
          try {
            const arr = typeof card.subtypes === "string" ? JSON.parse(card.subtypes) : card.subtypes;
            if (Array.isArray(arr) && arr.includes("Basic")) isBasic = true;
          } catch {
            if (typeof card.subtypes === "string" && card.subtypes.includes("Basic")) isBasic = true;
          }
        }
        if (isBasic) {
          // Use e.g. 'Psychic Energy SVE 5'
          line = `${quantity} ${name} ${ptcgoCode} ${number}`;
        } else {
          // Special energy, just use name and code
          line = `${quantity} ${name} ${ptcgoCode} ${number}`;
        }
        energy.push(line);
        energyCount += quantity;
      } else if (supertype === "Pokémon") {
        line = `${quantity} ${name} ${ptcgoCode} ${number}`;
        pokemon.push(line);
        pokemonCount += quantity;
      } else if (supertype === "Trainer") {
        line = `${quantity} ${name} ${ptcgoCode} ${number}`;
        trainer.push(line);
        trainerCount += quantity;
      }
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

  // Import modal UI only (logic to be implemented)
  if (!cardDb) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <ActivityIndicator
          size="large"
          color={theme.colors.purple}
        />
      </View>
    );
  }

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
        onConfirm={async () => {
          setImporting(true);
          if (!cardDb) {
            // Optionally show a message to the user here
            setImporting(false);
            setImportModalVisible(false);
            return;
          }
          try {
            // --- IMPORT LOGIC START ---
            const lines = importText.split(/\r?\n/);
            let section = null;
            const cardLines = [];
            for (const line of lines) {
              if (/^Pok[ée]mon:/i.test(line)) section = "pokemon";
              else if (/^Trainer:/i.test(line)) section = "trainer";
              else if (/^Energy:/i.test(line)) section = "energy";
              else if (line.trim() && section) cardLines.push({ section, line: line.trim() });
            }
            // Parse each card line
            const parsed = cardLines
              .map(({ section, line }) => {
                // e.g. 2 Gardevoir ex PAF 29
                const m = line.match(/^(\d+)\s+(.+?)\s+([A-Z0-9\-]+)\s+(\d+)$/);
                if (!m) return null;
                const [, quantity, name, ptcgoCode, number] = m;
                return { section, quantity: parseInt(quantity, 10), name, ptcgoCode, number };
              })
              .filter((card) => card !== null);
            // Query CardSet table for ptcgoCode -> setId
            const ptcgoCodes = Array.from(new Set(parsed.map((card) => card && card.ptcgoCode)));
            const placeholders = ptcgoCodes.map(() => "?").join(",");
            const setRows = await cardDb.getAllAsync(
              `SELECT id, ptcgoCode FROM CardSet WHERE ptcgoCode IN (${placeholders})`,
              ptcgoCodes
            );
            const ptcgoToSetId: Record<string, number> = {};
            for (const set of setRows) ptcgoToSetId[set.ptcgoCode] = set.id;
            // Find cards in db
            const deckCards = [];
            for (const card of parsed) {
              if (!card) continue;
              // Handle basic energy special case
              if (
                card.section === "energy" &&
                /energy/i.test(card.name) &&
                card.ptcgoCode &&
                card.number &&
                /psychic|darkness|metal|fire|water|grass|lightning|fighting|fairy/i.test(card.name)
              ) {
                // Try to match our DB's basic energy name
                const energyType = card.name.replace(/\s*Energy.*/i, "").trim();
                const dbEnergyName = `Basic ${energyType} Energy`;
                const rows = await cardDb.getAllAsync(
                  "SELECT * FROM Card WHERE supertype = 'Energy' AND subtypes LIKE '%Basic%' AND name = ?",
                  [dbEnergyName]
                );
                if (rows && rows.length > 0) {
                  deckCards.push({ cardId: rows[0].cardId, quantity: card.quantity });
                  continue;
                }
              }
              // Normal card import
              const setId = ptcgoToSetId[card.ptcgoCode];
              if (!setId) continue;
              const rows = await cardDb.getAllAsync("SELECT * FROM Card WHERE setId = ? AND number = ?", [
                setId,
                card.number,
              ]);
              if (rows && rows.length > 0) {
                deckCards.push({ cardId: rows[0].cardId, quantity: card.quantity });
              }
            }
            // Build new deck object (structure may need to match your app)
            const newDeck = { ...deck, cards: deckCards };
            setDeck(newDeck);
            // Persist imported cards to user DB
            if (db && deckId) {
              await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(deckCards), Number(deckId)]);
            }
            // Also update decksVersion if available (for parent sync)
            if (typeof decksVersion === "number" && typeof incrementDecksVersion === "function") {
              incrementDecksVersion();
            }
            // --- IMPORT LOGIC END ---
          } catch (e) {
            // Optionally show error
            console.error(e);
          }
          setImporting(false);
          setImportModalVisible(false);
        }}
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
