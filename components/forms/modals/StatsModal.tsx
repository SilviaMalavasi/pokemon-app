import React from "react";
import ThemedModal from "@/components/base/ThemedModal";
import NumberInput from "@/components/base/NumberInput";

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
  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="alternative"
      buttonSize="small"
    >
      <NumberInput
        label="HP"
        value={cardHp}
        onChange={(val, op) => {
          setCardHp(val);
          setCardHpOperator(op);
        }}
        placeholder="Card HP"
        showOperatorSelect={"basic"}
      />
      <NumberInput
        label="Card Converted Retreat Cost"
        value={cardConvertedRetreatCost}
        onChange={(val, op) => {
          setCardConvertedRetreatCost(val);
          setCardConvertedRetreatCostOperator(op);
        }}
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
