import React from "react";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import ThemedText from "@/components/base/ThemedText";
import ThemedModal from "@/components/base/ThemedModal";
import { theme } from "@/style/ui/Theme";

interface AbilitiesModalProps {
  visible: boolean;
  onClose: () => void;
  abilitiesName: string;
  setAbilitiesName: (val: string) => void;
  abilitiesText: string;
  setAbilitiesText: (val: string) => void;
  hasAnyAbility: boolean;
  setHasAnyAbility: (val: boolean) => void;
}

export default function AbilitiesModal({
  visible,
  onClose,
  abilitiesName,
  setAbilitiesName,
  abilitiesText,
  setAbilitiesText,
  hasAnyAbility,
  setHasAnyAbility,
}: AbilitiesModalProps) {
  // Reset all values to their initial state
  const handleCancel = () => {
    setAbilitiesName("");
    setAbilitiesText("");
    setHasAnyAbility(false);
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
        Abilities
      </ThemedText>
      <ThemedTextInput
        label="Ability Name"
        value={abilitiesName}
        onChange={setAbilitiesName}
        placeholder="Ability Name"
      />
      <AutoCompleteInput
        label="Abilitiy Text"
        value={abilitiesText}
        onChange={setAbilitiesText}
        suggestions={["search", "discard pile", "attach", "energy"]}
        placeholder="Ability Text"
      />
      <ThemedSwitch
        value={hasAnyAbility}
        label="Has any ability"
        onValueChange={setHasAnyAbility}
      />
    </ThemedModal>
  );
}

export function getAbilitiesFilters(abilitiesName: string, abilitiesText: string, hasAnyAbility: boolean) {
  return [
    abilitiesName && {
      config: { key: "abilityName", type: "text", table: "Abilities", column: "name" },
      value: abilitiesName,
    },
    abilitiesText && {
      config: { key: "abilityText", type: "text", table: "Abilities", column: "text" },
      value: abilitiesText,
    },
    hasAnyAbility && {
      config: { key: "hasAnyAbility", type: "exists", table: "CardAbilities", column: "cardId" },
      value: true,
    },
  ].filter(Boolean);
}
