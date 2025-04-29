import React from "react";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import ThemedText from "@/components/base/ThemedText";
import ThemedModal from "@/components/base/ThemedModal";

import { theme } from "@/style/ui/Theme";

interface RulesModalProps {
  visible: boolean;
  onClose: () => void;
  cardRules: string;
  setCardRules: (val: string) => void;
}

export default function RulesModal({ visible, onClose, cardRules, setCardRules }: RulesModalProps) {
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
        Rules
      </ThemedText>
      <AutoCompleteInput
        label="Rules"
        value={cardRules}
        labelHint="Rules are card effect for Trainers, card special rules for Pokèmon - Tera, Ex..."
        onChange={setCardRules}
        suggestions={["search", "discard pile", "attach", "energy"]}
        placeholder="Card rules"
      />
    </ThemedModal>
  );
}
