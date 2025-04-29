import React from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedModal from "@/components/base/ThemedModal";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import NumberInput from "@/components/base/NumberInput";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import styles from "@/style/base/ThemedModalStyle";
import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";

interface EditionModalProps {
  visible: boolean;
  onClose: () => void;
  cardRegulationMark: string[];
  setCardRegulationMark: (val: string[]) => void;
  cardSetName: string[];
  setCardSetName: (val: string[]) => void;
  cardNumber: number | "";
  setCardNumber: (val: number | "") => void;
  cardSetNumber: string;
  setCardSetNumber: (val: string) => void;
}

export default function EditionModal({
  visible,
  onClose,
  cardRegulationMark,
  setCardRegulationMark,
  cardSetName,
  setCardSetName,
  cardNumber,
  setCardNumber,
  cardSetNumber,
  setCardSetNumber,
}: EditionModalProps) {
  const cardRegulationMarkOptions = uniqueIdentifiers.cardRegulationMark.map((v: string) => ({ value: v, label: v }));
  const cardSetNamesOptions = uniqueIdentifiers.cardSetNames.map((v: string) => ({ value: v, label: v }));
  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="alternative"
      buttonSize="small"
    >
      <DynamicMultiSelect
        label="Regulation Mark"
        value={cardRegulationMark}
        options={cardRegulationMarkOptions}
        onChange={setCardRegulationMark}
        labelHint="Include cards that match ANY of the selected choices."
      />
      <DynamicMultiSelect
        label="Set Name"
        value={cardSetName}
        options={cardSetNamesOptions}
        onChange={setCardSetName}
        labelHint="Include cards that match ANY of the selected choices."
      />
      <NumberInput
        label="Card Number"
        value={cardNumber}
        onChange={setCardNumber}
        placeholder="Card number"
      />
      <ThemedTextInput
        label="Card/Set Number"
        value={cardSetNumber}
        onChange={setCardSetNumber}
        placeholder="Card/Set Number"
      />
    </ThemedModal>
  );
}

export function getEditionFilters(
  cardRegulationMark: string[],
  cardSetName: string[],
  cardNumber: number | "",
  cardSetNumber: string
) {
  return [
    cardRegulationMark.length > 0 && {
      config: { key: "regulationMark", type: "multiselect", table: "Card", column: "regulationMark" },
      value: cardRegulationMark,
    },
    cardSetName.length > 0 && {
      config: { key: "setName", type: "multiselect", table: "CardSet", column: "name" },
      value: cardSetName,
    },
    cardNumber !== "" && {
      config: { key: "number", type: "number", table: "Card", column: "number", valueType: "text" },
      value: cardNumber,
      operator: "=",
    },
    cardSetNumber && {
      config: { key: "cardSetNumber", type: "text", table: "Card", column: "cardId" },
      value: cardSetNumber,
    },
  ].filter(Boolean);
}
