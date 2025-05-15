import React from "react";
import { Modal, Pressable, View, SafeAreaView, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  onCancelText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
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
  onCancelText,
  onCancel,
  onConfirm,
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
                <ScrollView
                  contentContainerStyle={{ alignItems: "center" }}
                  persistentScrollbar={true}
                >
                  {children}
                  <View style={styles.buttonContainer}>
                    {onCancel && (
                      <ThemedButton
                        title={onCancelText || "Reset"}
                        type="alternative"
                        size="large"
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
