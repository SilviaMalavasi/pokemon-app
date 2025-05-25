import React from "react";
import ThemedTextInput from "@/components/base/ThemedTextInput";
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
  // Reset all values to their initial state
  const handleCancel = () => {
    setCardRules("");
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
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Rules/Rule Box
      </ThemedText>
      <ThemedTextInput
        value={cardRules}
        labelHint="Search for card TextEffect in Trainer cards and Rule Box in Pokèmon cards"
        onChange={setCardRules}
        placeholder="Rule/Rule Box"
      />
    </ThemedModal>
  );
}

export function getRulesFilters(cardRules: string) {
  return [
    cardRules !== "" && {
      config: {
        key: "cardRules",
        type: "text",
        table: "Card",
        column: "rules",
      },
      value: cardRules,
    },
  ].filter(Boolean);
}
