import React from "react";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import ThemedModal from "@/components/base/ThemedModal";

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
      <AutoCompleteInput
        label="Rules"
        value={cardRules}
        onChange={setCardRules}
        suggestions={["search", "discard pile", "attach", "energy"]}
        placeholder="Card rules"
      />
    </ThemedModal>
  );
}
