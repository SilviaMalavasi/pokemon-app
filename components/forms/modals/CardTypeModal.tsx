import React from "react";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedMultiSelect from "@/components/base/ThemedMultiSelect";
import uniqueIdentifiers from "@/helpers/uniqueIdentifiers.json";
import ThemedText from "@/components/base/ThemedText";
import { theme } from "@/style/ui/Theme";

interface CardTypeModalProps {
  visible: boolean;
  onClose: () => void;
  cardSupertype: string[];
  setCardSupertype: (val: string[]) => void;
  cardSubtypes: string[];
  setCardSubtypes: (val: string[]) => void;
  cardTypes: string[];
  setCardTypes: (val: string[]) => void;
}

export default function CardTypeModal({
  visible,
  onClose,
  cardSupertype,
  setCardSupertype,
  cardSubtypes,
  setCardSubtypes,
  cardTypes,
  setCardTypes,
}: CardTypeModalProps) {
  const cardSupertypeOptions = uniqueIdentifiers.cardSupertype.map((v: string) => ({ value: v, label: v }));

  const allSubtypes = Array.from(
    new Set([
      ...(uniqueIdentifiers.cardSubtypePokémon ?? []),
      ...(uniqueIdentifiers.cardSubtypeTrainer ?? []),
      ...(uniqueIdentifiers.cardSubtypeEnergy ?? []),
    ])
  );

  const cardSubtypesOptions = allSubtypes.map((v) => ({ value: v, label: v }));

  const cardTypesOptions = uniqueIdentifiers.cardTypes.map((v: string) => ({ value: v, label: v }));

  // Reset all values to their initial state
  const handleCancel = () => {
    setCardSupertype([]);
    setCardSubtypes([]);
    setCardTypes([]);
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="alternative"
      buttonSize="large"
      onCancel={handleCancel}
    >
      <ThemedText
        type="subtitle"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Card Type
      </ThemedText>
      <ThemedMultiSelect
        label="Type"
        value={cardSupertype}
        options={cardSupertypeOptions}
        onChange={setCardSupertype}
      />
      <ThemedMultiSelect
        label="Label"
        value={cardSubtypes}
        options={cardSubtypesOptions}
        onChange={setCardSubtypes}
      />
      <ThemedMultiSelect
        label="Energy Type"
        value={cardTypes}
        options={cardTypesOptions}
        onChange={setCardTypes}
      />
    </ThemedModal>
  );
}

export function getCardTypeFilters(cardSupertype: string[], cardSubtypes: string[], cardTypes: string[]) {
  return [
    cardSupertype.length > 0 && {
      config: { key: "cardSupertype", type: "multiselect", table: "Card", column: "supertype" },
      value: cardSupertype,
    },
    cardSubtypes.length > 0 && {
      config: {
        key: "cardSubtypes",
        type: "multiselect",
        table: "Card",
        column: "subtypes",
        valueType: "json-string-array",
      },
      value: cardSubtypes,
    },
    cardTypes.length > 0 && {
      config: {
        key: "cardTypes",
        type: "multiselect",
        table: "Card",
        column: "types",
        valueType: "json-string-array",
      },
      value: cardTypes,
    },
  ].filter(Boolean);
}
