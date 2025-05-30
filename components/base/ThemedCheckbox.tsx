import React from "react";
import { Pressable, View, ViewStyle, StyleProp } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/base/ThemedCheckboxStyle";

interface ThemedCheckboxProps {
  checked: boolean;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function ThemedCheckbox({ checked, label, onPress, style }: ThemedCheckboxProps) {
  return (
    <Pressable
      style={[styles.container, style]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View style={styles.fakeInnerShadow} />
      {checked && <View style={styles.checkboxInner} />}
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}></View>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
}
