import { PropsWithChildren, useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/style/Colors";
import styles from "@/style/base/CollapsibleStyle";

export default function Collapsible({
  children,
  title,
  resetKey,
}: PropsWithChildren & { title: string; resetKey?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [resetKey]);

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={Colors.icon}
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />

        <ThemedText type="subtitle">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}
