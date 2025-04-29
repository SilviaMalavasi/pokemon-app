import React from "react";
import ThemedModal from "@/components/base/ThemedModal";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";

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
  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="alternative"
      buttonSize="small"
    >
      <DynamicMultiSelect
        label="Stage"
        value={cardStage}
        options={cardStageOptions}
        onChange={setCardStage}
        labelHint="Include cards that match ANY of the selected choices."
      />
      <ThemedTextInput
        label="Evolves From"
        value={cardEvolvesFrom}
        onChange={setCardEvolvesFrom}
        placeholder="Evolves from"
      />
      <ThemedTextInput
        label="Evolves To"
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
