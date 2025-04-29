import React from "react";
import { Pressable, View, ViewStyle, StyleProp } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/base/ThemedCheckboxStyle";
import { theme } from "@/style/ui/Theme";

interface ThemedCheckboxProps {
  checked: boolean;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const ThemedCheckbox: React.FC<ThemedCheckboxProps> = ({ checked, label, onPress, style }) => (
  <Pressable
    style={[styles.container, style]}
    onPress={onPress}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
  >
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <View style={styles.checkboxInner} />}
    </View>
    <ThemedText style={styles.label}>{label}</ThemedText>
  </Pressable>
);

export default ThemedCheckbox;
