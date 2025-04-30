import React from "react";
import { Modal, Pressable, View, SafeAreaView, Platform, ScrollView } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedText from "@/components/base/ThemedText";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedModalStyle";

interface ThemedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonText?: string;
  buttonType?: import("@/style/base/ThemedButtonStyle").ButtonType;
  buttonSize?: "small" | "large";
  buttonStyle?: any;
  contentStyle?: any;
  onCancel?: () => void;
}

export default function ThemedModal({
  visible,
  onClose,
  children,
  buttonText = "Close",
  buttonType = "main",
  buttonSize = "large",
  buttonStyle,
  contentStyle,
  onCancel,
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
            style={[styles.centeredView, contentStyle]}
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
                <ThemedView style={styles.buttonContainer}>
                  {onCancel && (
                    <Pressable
                      onPress={() => {
                        onCancel();
                        onClose();
                      }}
                      style={styles.modalCancel}
                    >
                      <ThemedText style={{ color: theme.colors.placeholder, padding: theme.padding.medium }}>
                        Reset
                      </ThemedText>
                    </Pressable>
                  )}
                  <ThemedButton
                    title={buttonText}
                    type={buttonType}
                    size={buttonSize}
                    style={[styles.button, buttonStyle]}
                    onPress={onClose}
                  />
                </ThemedView>
              </ScrollView>
            </ThemedView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
