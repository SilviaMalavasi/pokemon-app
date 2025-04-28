import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import NumberInput from "@/components/base/NumberInput";
import styles from "@/style/base/ThemedModalStyle";

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable
          style={styles.overlay}
          onPress={onClose}
        >
          <View
            style={styles.centeredView}
            pointerEvents="box-none"
          >
            <ThemedView style={styles.modalView}>
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
              <ThemedButton
                title="Close"
                onPress={onClose}
                style={{ marginTop: 16 }}
              />
            </ThemedView>
          </View>
        </Pressable>
      </SafeAreaView>
    </Modal>
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
