import React from "react";
import { Modal, Pressable, View, SafeAreaView, Platform, ScrollView } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import styles from "@/style/base/ThemedModalStyle";

interface ThemedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonText?: string;
  buttonType?: import("@/style/base/ThemedButtonStyle").ButtonType;
  buttonSize?: "small" | "large";
  buttonStyle?: any;
}

export default function ThemedModal({
  visible,
  onClose,
  children,
  buttonText = "Close",
  buttonType = "main",
  buttonSize = "large",
  buttonStyle,
}: ThemedModalProps) {
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
        <View style={styles.modalRoot}>
          <Pressable
            onPress={onClose}
            style={[Platform.OS === "ios" ? styles.iOSBackdrop : styles.androidBackdrop, styles.backdrop]}
          />
          <View
            style={styles.centeredView}
            pointerEvents="box-none"
          >
            <ThemedView
              style={styles.modalView}
              pointerEvents="auto"
            >
              <ScrollView
                contentContainerStyle={{ alignItems: "center" }}
                style={styles.scrollView}
                persistentScrollbar={true}
              >
                {children}
                <ThemedButton
                  title={buttonText}
                  type={buttonType}
                  size={buttonSize}
                  style={[styles.button, buttonStyle]}
                  onPress={onClose}
                />
              </ScrollView>
            </ThemedView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
