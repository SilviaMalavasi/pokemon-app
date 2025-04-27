import React from "react";
import { Modal, Pressable, View, StyleSheet, Platform, StatusBar, SafeAreaView } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import styles from "@/style/base/ThemedModalStyle";

interface ThemedModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
  buttonText?: string;
}

export default function ThemedModal({ visible, onClose, message, buttonText = "OK" }: ThemedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true} // <-- This is key for Android
      presentationStyle="overFullScreen" // <-- Ensures overlay covers all
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
              <ThemedText
                type="default"
                style={styles.message}
              >
                {message}
              </ThemedText>
              <ThemedButton
                title={buttonText}
                onPress={onClose}
                style={styles.button}
              />
            </ThemedView>
          </View>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}
