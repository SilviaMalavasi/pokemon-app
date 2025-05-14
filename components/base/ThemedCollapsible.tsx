import { PropsWithChildren, useState, useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Svg, Path } from "react-native-svg";
import ThemedText from "@/components/base/ThemedText";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";
import styles from "@/style/base/ThemedCollapsibleStyle";

// ChevronRightIcon component, defined like in ThemedButton
function ChevronRightIcon({ color }: { color: string }) {
  return (
    <Svg
      width={theme.padding.medium}
      height={theme.padding.medium}
      viewBox="0 0 24 24"
    >
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={vw(0.5)}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

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
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <View style={{ transform: [{ rotate: actualOpen ? "90deg" : "0deg" }] }}>
          <ChevronRightIcon color={theme.colors.purple} />
        </View>
        <ThemedText
          type="buttonSmall"
          color={theme.colors.text}
        >
          {title}
        </ThemedText>
      </TouchableOpacity>
      {actualOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}
