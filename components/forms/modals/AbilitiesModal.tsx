import React from "react";
import ThemedView from "@/components/base/ThemedView";
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
        Abilities
      </ThemedText>
      <ThemedTextInput
        label="Abilities Name"
        value={abilitiesName}
        onChange={setAbilitiesName}
        placeholder="Ability name"
      />
      <AutoCompleteInput
        label="Abilities Text"
        value={abilitiesText}
        onChange={setAbilitiesText}
        suggestions={["search", "discard pile", "attach", "energy"]}
        placeholder="Ability text"
      />
      <ThemedView style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
        <ThemedSwitch
          value={hasAnyAbility}
          onValueChange={setHasAnyAbility}
        />
        <ThemedText
          type="default"
          style={{ paddingLeft: 8 }}
        >
          Has any ability
        </ThemedText>
      </ThemedView>
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
