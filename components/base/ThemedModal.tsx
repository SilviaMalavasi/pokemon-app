import React from "react";
import { Modal, Pressable, View, SafeAreaView, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ThemedButton from "@/components/base/ThemedButton";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedModalStyle";

interface ThemedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonText?: string;
  buttonType?: import("@/style/base/ThemedButtonStyle").ButtonType;
  buttonSize?: "small" | "large";
  contentStyle?: any;
  onCancelText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  disabled?: boolean;
}

export default function ThemedModal({
  visible,
  onClose,
  children,
  buttonText = "Close",
  buttonType = "main",
  buttonSize = "large",
  contentStyle,
  onCancelText,
  onCancel,
  onConfirm,
  disabled = false,
}: ThemedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalRoot}>
          <Pressable
            onPress={onClose}
            style={[Platform.OS === "ios" ? styles.iOSBackdrop : styles.androidBackdrop, styles.backdrop]}
            accessibilityLabel="Close modal"
          />
          <View
            style={[styles.centeredView, contentStyle]}
            pointerEvents="box-none"
          >
            <View
              style={styles.modalView}
              pointerEvents="auto"
            >
              <LinearGradient
                colors={[theme.colors.mediumGrey, theme.colors.darkGrey]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.4, y: 1 }}
                style={styles.mainModal}
              >
                <ScrollView contentContainerStyle={{ alignItems: "center" }}>
                  {children}
                  <View style={styles.buttonContainer}>
                    {onCancel && (
                      <ThemedButton
                        title={onCancelText || "Reset"}
                        type="alternative"
                        size="small"
                        onPress={() => {
                          onCancel();
                          onClose();
                        }}
                      />
                    )}
                    <ThemedButton
                      title={buttonText}
                      type={buttonType}
                      size={buttonSize}
                      onPress={onConfirm ? onConfirm : onClose}
                      disabled={disabled}
                    />
                  </View>
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
