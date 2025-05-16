import React from "react";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedMultiSelect from "@/components/base/ThemedMultiSelect";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import ThemedText from "@/components/base/ThemedText";
import uniqueIdentifiers from "@/helpers/uniqueIdentifiers.json";

import { theme } from "@/style/ui/Theme";

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

  // Reset all values to their initial state
  const handleCancel = () => {
    setCardRegulationMark([]);
    setCardSetName([]);
    setCardNumber("");
    setCardSetNumber("");
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="main"
      buttonSize="large"
      onCancel={handleCancel}
    >
      <ThemedText
        type="h2"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Edition
      </ThemedText>
      <ThemedMultiSelect
        label="Regulation Mark"
        value={cardRegulationMark}
        options={cardRegulationMarkOptions}
        onChange={setCardRegulationMark}
      />
      <ThemedMultiSelect
        label="Set Name"
        value={cardSetName}
        options={cardSetNamesOptions}
        onChange={setCardSetName}
      />
      <ThemedTextInput
        value={cardSetNumber}
        onChange={setCardSetNumber}
        placeholder="Pokédex number"
        labelHint="Use the tournament format SetId-Number (e.g. SV3-27)"
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
    cardSetNumber && {
      config: { key: "cardSetNumber", type: "text", table: "Card", column: "cardId" },
      value: cardSetNumber,
    },
  ].filter(Boolean);
}
