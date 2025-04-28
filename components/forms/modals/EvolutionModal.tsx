import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import styles from "@/style/base/ThemedModalStyle";

interface EvolutionModalProps {
  visible: boolean;
  onClose: () => void;
  cardStage: string[];
  setCardStage: (val: string[]) => void;
  cardEvolvesFrom: string;
  setCardEvolvesFrom: (val: string) => void;
  cardEvolvesTo: string;
  setCardEvolvesTo: (val: string) => void;
  cardStageOptions: { value: string; label: string }[];
}

export default function EvolutionModal({
  visible,
  onClose,
  cardStage,
  setCardStage,
  cardEvolvesFrom,
  setCardEvolvesFrom,
  cardEvolvesTo,
  setCardEvolvesTo,
  cardStageOptions,
}: EvolutionModalProps) {
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
                label="Stage"
                value={cardStage}
                options={cardStageOptions}
                onChange={setCardStage}
                labelHint="Include cards that match ANY of the selected choices."
              />
              <ThemedTextInput
                label="Evolves From"
                value={cardEvolvesFrom}
                onChange={setCardEvolvesFrom}
                placeholder="Evolves from"
              />
              <ThemedTextInput
                label="Evolves To"
                value={cardEvolvesTo}
                onChange={setCardEvolvesTo}
                placeholder="Evolves to"
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
