import React from "react";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedMultiSelect from "@/components/base/ThemedMultiSelect";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import ThemedText from "@/components/base/ThemedText";
import uniqueIdentifiers from "@/helpers/uniqueIdentifiers.json";

import { theme } from "@/style/ui/Theme";

interface EvolutionModalProps {
  visible: boolean;
  onClose: () => void;
  cardStage: string[];
  setCardStage: (val: string[]) => void;
  cardEvolvesFrom: string;
  setCardEvolvesFrom: (val: string) => void;
  cardEvolvesTo: string;
  setCardEvolvesTo: (val: string) => void;
}

export default function EvolutionModal({
  visible,
  onClose,
  cardStage,
  setCardStage,
  cardEvolvesFrom,
  setCardEvolvesFrom,
  cardEvolvesTo,
  setCardEvolvesTo,
}: EvolutionModalProps) {
  const cardStageOptions = uniqueIdentifiers.cardStagePokémon.map((v: string) => ({ value: v, label: v }));
  // Reset all values to their initial state
  const handleCancel = () => {
    setCardStage([]);
    setCardEvolvesFrom("");
    setCardEvolvesTo("");
  };
  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="Set Filters"
      buttonType="main"
      buttonSize="large"
      onCancel={handleCancel}
    >
      <ThemedText
        type="h3"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Evolution
      </ThemedText>
      <ThemedMultiSelect
        label="Stage"
        value={cardStage}
        options={cardStageOptions}
        onChange={setCardStage}
      />
      <ThemedTextInput
        value={cardEvolvesFrom}
        onChange={setCardEvolvesFrom}
        placeholder="Evolves from"
      />
      <ThemedTextInput
        value={cardEvolvesTo}
        onChange={setCardEvolvesTo}
        placeholder="Evolves to"
      />
    </ThemedModal>
  );
}

export function getEvolutionFilters(cardStage: string[], cardEvolvesFrom: string, cardEvolvesTo: string) {
  return [
    cardStage.length > 0 && {
      config: { key: "stage", type: "multiselect", table: "Card", column: "subtypes" },
      value: cardStage,
    },
    cardEvolvesFrom && {
      config: { key: "evolvesFrom", type: "text", table: "Card", column: "evolvesFrom" },
      value: cardEvolvesFrom,
    },
    cardEvolvesTo && {
      config: { key: "evolvesTo", type: "text", table: "Card", column: "evolvesTo", valueType: "json-string-array" },
      value: cardEvolvesTo,
    },
  ].filter(Boolean);
}
