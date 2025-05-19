import React, { useState } from "react";
import { View, Dimensions } from "react-native";
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

const DeckImportExport: React.FC<DeckImportExportProps> = ({
  deck,
  cardDb,
  db,
  getCardsArray,
  setDeck,
  decksVersion,
  deckId,
}) => {
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const screenHeight = Dimensions.get("window").height;

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
          // TODO: implement import logic here
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
