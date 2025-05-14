import React from "react";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedNumberInput from "@/components/base/ThemedNumberInput";
import ThemedText from "@/components/base/ThemedText";

import { theme } from "@/style/ui/Theme";

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  cardHp: number | "";
  setCardHp: (val: number | "") => void;
  cardHpOperator: string;
  setCardHpOperator: (val: string) => void;
  cardConvertedRetreatCost: number | "";
  setCardConvertedRetreatCost: (val: number | "") => void;
  cardConvertedRetreatCostOperator: string;
  setCardConvertedRetreatCostOperator: (val: string) => void;
}

export default function StatsModal({
  visible,
  onClose,
  cardHp,
  setCardHp,
  cardHpOperator,
  setCardHpOperator,
  cardConvertedRetreatCost,
  setCardConvertedRetreatCost,
  cardConvertedRetreatCostOperator,
  setCardConvertedRetreatCostOperator,
}: StatsModalProps) {
  // Reset all values to their initial state
  const handleCancel = () => {
    setCardHp("");
    setCardHpOperator("");
    setCardConvertedRetreatCost("");
    setCardConvertedRetreatCostOperator("");
  };
  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="main"
      buttonSize="large"
      onCancel={handleCancel}
    >
      <ThemedText
        type="h2"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Stats
      </ThemedText>
      <ThemedNumberInput
        label="Pokèmon HP"
        value={cardHp}
        onChange={(val, op) => {
          setCardHp(val);
          setCardHpOperator(op);
        }}
        operator={cardHpOperator}
        onOperatorChange={setCardHpOperator}
        placeholder="Pokèmon HP"
        showOperatorSelect={"basic"}
      />
      <ThemedNumberInput
        label="Retreat Cost"
        value={cardConvertedRetreatCost}
        onChange={(val, op) => {
          setCardConvertedRetreatCost(val);
          setCardConvertedRetreatCostOperator(op);
        }}
        operator={cardConvertedRetreatCostOperator}
        onOperatorChange={setCardConvertedRetreatCostOperator}
        placeholder="Retreat cost"
        showOperatorSelect={"basic"}
      />
    </ThemedModal>
  );
}

export function getStatsFilters(
  cardHp: number | "",
  cardHpOperator: string,
  cardConvertedRetreatCost: number | "",
  cardConvertedRetreatCostOperator: string
) {
  return [
    cardHp !== "" && {
      config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
      value: cardHp,
      operator: cardHpOperator,
    },
    cardConvertedRetreatCost !== "" && {
      config: {
        key: "convertedRetreatCost",
        type: "number",
        table: "Card",
        column: "convertedRetreatCost",
        valueType: "int",
      },
      value: cardConvertedRetreatCost,
      operator: cardConvertedRetreatCostOperator,
    },
  ].filter(Boolean);
}
