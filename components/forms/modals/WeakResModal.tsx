import React from "react";
import ThemedMultiSelect from "@/components/base/ThemedMultiSelect";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";

import { theme } from "@/style/ui/Theme";

interface WeakResModalProps {
  visible: boolean;
  onClose: () => void;
  cardWeaknessesType: string[];
  setCardWeaknessesType: (val: string[]) => void;
  cardResistancesType: string[];
  setCardResistancesType: (val: string[]) => void;
}

export default function WeakResModal({
  visible,
  onClose,
  cardWeaknessesType,
  setCardWeaknessesType,
  cardResistancesType,
  setCardResistancesType,
}: WeakResModalProps) {
  const cardWeaknessesTypeOptions = uniqueIdentifiers.cardWeaknessTypes.map((v: string) => ({ value: v, label: v }));
  const cardResistancesTypeOptions = uniqueIdentifiers.cardResistanceTypes.map((v: string) => ({ value: v, label: v }));

  // Reset all values to their initial state
  const handleCancel = () => {
    setCardWeaknessesType([]);
    setCardResistancesType([]);
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="alternative"
      buttonSize="small"
      onCancel={handleCancel}
    >
      <ThemedText
        type="subtitle"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Weaknesses & Resistances
      </ThemedText>
      <ThemedMultiSelect
        label="Weaknesses Type"
        value={cardWeaknessesType}
        options={cardWeaknessesTypeOptions}
        onChange={setCardWeaknessesType}
      />
      <ThemedMultiSelect
        label="Resistances Type"
        value={cardResistancesType}
        options={cardResistancesTypeOptions}
        onChange={setCardResistancesType}
      />
    </ThemedModal>
  );
}

export function getWeakResFilters(cardWeaknessesType: string[], cardResistancesType: string[]) {
  return [
    cardWeaknessesType.length > 0 && {
      config: {
        key: "weaknesses",
        type: "multiselect",
        table: "Card",
        column: "weaknesses",
        valueType: "json-string-array",
      },
      value: cardWeaknessesType,
    },
    cardResistancesType.length > 0 && {
      config: {
        key: "resistances",
        type: "multiselect",
        table: "Card",
        column: "resistances",
        valueType: "json-string-array",
      },
      value: cardResistancesType,
    },
  ].filter(Boolean);
}
