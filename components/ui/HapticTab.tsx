import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

export function HapticTab(props: BottomTabBarButtonProps) {
  // Forward all props, including accessibilityLabel, to PlatformPressable and render children for visible tab labels
  const { children, ...rest } = props;
  return (
    <PlatformPressable
      {...rest}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (props.onPressIn) props.onPressIn(ev);
      }}
    >
      {children}
    </PlatformPressable>
  );
}
