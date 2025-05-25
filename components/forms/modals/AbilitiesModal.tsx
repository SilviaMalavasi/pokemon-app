import React from "react";
import ThemedTextInput from "@/components/base/ThemedTextInput";
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
  const handleCancel = () => {
    setAbilitiesName("");
    setAbilitiesText("");
    setHasAnyAbility(false);
    onClose();
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
        accessibilityRole="header"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Abilities
      </ThemedText>
      <ThemedTextInput
        value={abilitiesName}
        onChange={setAbilitiesName}
        placeholder="Ability Name"
      />
      <ThemedTextInput
        value={abilitiesText}
        onChange={setAbilitiesText}
        placeholder="Ability Text"
      />
      <ThemedSwitch
        value={hasAnyAbility}
        label="Has any ability"
        accessibilityLabel="Toggle to filter cards that have any ability"
        onValueChange={setHasAnyAbility}
        style={{ marginVertical: theme.padding.medium }}
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
