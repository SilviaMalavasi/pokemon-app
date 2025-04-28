import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import NumberInput from "@/components/base/NumberInput";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import styles from "@/style/base/ThemedModalStyle";

interface EditionModalProps {
  visible: boolean;
  onClose: () => void;
  cardRegulationMark: string[];
  setCardRegulationMark: (val: string[]) => void;
  cardSetName: string[];
  setCardSetName: (val: string[]) => void;
  cardNumber: number | "";
  setCardNumber: (val: number | "") => void;
  cardSetNumber: string;
  setCardSetNumber: (val: string) => void;
  cardRegulationMarkOptions: { value: string; label: string }[];
  cardSetNamesOptions: { value: string; label: string }[];
}

export default function EditionModal({
  visible,
  onClose,
  cardRegulationMark,
  setCardRegulationMark,
  cardSetName,
  setCardSetName,
  cardNumber,
  setCardNumber,
  cardSetNumber,
  setCardSetNumber,
  cardRegulationMarkOptions,
  cardSetNamesOptions,
}: EditionModalProps) {
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
                label="Regulation Mark"
                value={cardRegulationMark}
                options={cardRegulationMarkOptions}
                onChange={setCardRegulationMark}
                labelHint="Include cards that match ANY of the selected choices."
              />
              <DynamicMultiSelect
                label="Set Name"
                value={cardSetName}
                options={cardSetNamesOptions}
                onChange={setCardSetName}
                labelHint="Include cards that match ANY of the selected choices."
              />
              <NumberInput
                label="Card Number"
                value={cardNumber}
                onChange={setCardNumber}
                placeholder="Card number"
              />
              <ThemedTextInput
                label="Card/Set Number"
                value={cardSetNumber}
                onChange={setCardSetNumber}
                placeholder="Card/Set Number"
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
