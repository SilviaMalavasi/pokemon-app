import React from "react";
import ThemedModal from "@/components/base/ThemedModal";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";
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
      ...(uniqueIdentifiers.cardSubtypePokémon || []),
      ...(uniqueIdentifiers.cardSubtypeTrainer || []),
      ...(uniqueIdentifiers.cardSubtypeEnergy || []),
    ])
  );

  const getCardSubtypesOptions = (supertypes: string[]) => {
    let subtypeSet = new Set<string>();

    if (!supertypes || supertypes.length === 0) {
      allSubtypes.forEach((v) => subtypeSet.add(v));
    } else {
      supertypes.forEach((supertype) => {
        if (supertype === "Pokémon" && uniqueIdentifiers.cardSubtypePokémon) {
          uniqueIdentifiers.cardSubtypePokémon.forEach((v: string) => subtypeSet.add(v));
        } else if (supertype === "Trainer" && uniqueIdentifiers.cardSubtypeTrainer) {
          uniqueIdentifiers.cardSubtypeTrainer.forEach((v: string) => subtypeSet.add(v));
        } else if (supertype === "Energy" && uniqueIdentifiers.cardSubtypeEnergy) {
          uniqueIdentifiers.cardSubtypeEnergy.forEach((v: string) => subtypeSet.add(v));
        }
      });
    }
    return Array.from(subtypeSet).map((v) => ({ value: v, label: v }));
  };

  const cardSubtypesOptions = getCardSubtypesOptions(cardSupertype);

  const cardTypesOptions = uniqueIdentifiers.cardTypes.map((v: string) => ({ value: v, label: v }));

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="alternative"
      buttonSize="small"
    >
      <ThemedText
        type="subtitle"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Card Type
      </ThemedText>
      <DynamicMultiSelect
        label="Supertype"
        value={cardSupertype}
        options={cardSupertypeOptions}
        onChange={setCardSupertype}
        labelHint="Include cards that match ANY of the selected choices."
      />
      <DynamicMultiSelect
        label="Subtypes"
        value={cardSubtypes}
        options={cardSubtypesOptions}
        onChange={setCardSubtypes}
        labelHint="Include cards that match ANY of the selected choices."
      />
      {(cardSupertype.length === 0 || cardSupertype.includes("Pokémon") || cardSupertype.includes("Energy")) && (
        <DynamicMultiSelect
          label="Types"
          value={cardTypes}
          options={cardTypesOptions}
          onChange={setCardTypes}
          labelHint="Include cards that match ANY of the selected choices."
        />
      )}
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
