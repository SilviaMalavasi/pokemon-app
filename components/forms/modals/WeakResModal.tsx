import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import styles from "@/style/base/ThemedModalStyle";

interface WeakResModalProps {
  visible: boolean;
  onClose: () => void;
  cardWeaknessesType: string[];
  setCardWeaknessesType: (val: string[]) => void;
  cardResistancesType: string[];
  setCardResistancesType: (val: string[]) => void;
  cardWeaknessesTypeOptions: { value: string; label: string }[];
  cardResistancesTypeOptions: { value: string; label: string }[];
}

export default function WeakResModal({
  visible,
  onClose,
  cardWeaknessesType,
  setCardWeaknessesType,
  cardResistancesType,
  setCardResistancesType,
  cardWeaknessesTypeOptions,
  cardResistancesTypeOptions,
}: WeakResModalProps) {
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
              <DynamicMultiSelect
                label="Weaknesses Type"
                value={cardWeaknessesType}
                options={cardWeaknessesTypeOptions}
                onChange={setCardWeaknessesType}
                labelHint="Include cards that match ANY of the selected choices."
              />
              <DynamicMultiSelect
                label="Resistances Type"
                value={cardResistancesType}
                options={cardResistancesTypeOptions}
                onChange={setCardResistancesType}
                labelHint="Include cards that match ANY of the selected choices."
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
