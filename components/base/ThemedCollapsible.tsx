import { PropsWithChildren, useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedCollapsibleStyle";

export default function ThemedCollapsible({
  children,
  title,
  resetKey,
  open,
  onToggle,
}: PropsWithChildren & { title: string; resetKey?: number; open?: boolean; onToggle?: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  // If controlled, use the open prop; otherwise, use internal state
  const actualOpen = open !== undefined ? open : isOpen;

  useEffect(() => {
    setIsOpen(false);
  }, [resetKey]);

  const handleToggle = () => {
    if (open === undefined) {
      setIsOpen((value) => !value);
      if (onToggle) onToggle(!isOpen);
    } else {
      if (onToggle) onToggle(!open);
    }
  };

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme.colors.textAlternative}
          style={{ transform: [{ rotate: actualOpen ? "90deg" : "0deg" }] }}
        />
        <ThemedText type="subtitle">{title}</ThemedText>
      </TouchableOpacity>
      {actualOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}
