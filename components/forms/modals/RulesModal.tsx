import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import styles from "@/style/base/ThemedModalStyle";

interface RulesModalProps {
  visible: boolean;
  onClose: () => void;
  cardRules: string;
  setCardRules: (val: string) => void;
}

export default function RulesModal({ visible, onClose, cardRules, setCardRules }: RulesModalProps) {
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
              <AutoCompleteInput
                label="Rules"
                value={cardRules}
                onChange={setCardRules}
                suggestions={["search", "discard pile", "attach", "energy"]}
                placeholder="Card rules"
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
