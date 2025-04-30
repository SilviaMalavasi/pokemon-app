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
  // Reset all values to their initial state
  const handleCancel = () => {
    setCardRules("");
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
        Rules/Rule Box
      </ThemedText>
      <AutoCompleteInput
        label="Rules/Rule Box"
        value={cardRules}
        labelHint="Search for card TextEffect in Trainer cards and Rule Box in Pokèmon cards"
        onChange={setCardRules}
        suggestions={["search", "discard pile", "attach", "energy"]}
        placeholder="Card Rules"
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
