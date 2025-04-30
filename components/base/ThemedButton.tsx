import { ButtonProps, TouchableOpacity } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import { View } from "react-native";
import { Svg, Path, Rect } from "react-native-svg";
import { theme } from "@/style/ui/Theme";
import { Image } from "expo-image";

import { createButtonStyle } from "@/style/base/ThemedButtonStyle";
import { ButtonType, ButtonSize, ButtonStatus } from "@/style/base/ThemedButtonStyle";

export type ThemedButtonProps = ButtonProps & {
  type?: ButtonType;
  size?: ButtonSize;
  status?: ButtonStatus;
  width?: number | string;
  icon?: string | "void";
  style?: any;
};

// Icons
const IconSearch = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 26 24"
    fill="none"
  >
    <Path
      d="M24.9691 20.7495L20.1683 16.0766C19.9516 15.8656 19.6579 15.7485 19.3497 15.7485H18.5648C19.8938 14.0939 20.6835 12.0129 20.6835 9.74905C20.6835 4.36364 16.2005 0 10.6678 0C5.13514 0 0.652161 4.36364 0.652161 9.74905C0.652161 15.1345 5.13514 19.4981 10.6678 19.4981C12.9936 19.4981 15.1316 18.7294 16.8313 17.4358V18.1998C16.8313 18.4998 16.9517 18.7857 17.1684 18.9966L21.9692 23.6696C22.4218 24.1101 23.1537 24.1101 23.6015 23.6696L24.9643 22.3431C25.4169 21.9025 25.4169 21.1901 24.9691 20.7495ZM10.6678 15.7485C7.26347 15.7485 4.50434 13.0675 4.50434 9.74905C4.50434 6.43531 7.25866 3.74963 10.6678 3.74963C14.0722 3.74963 16.8313 6.43062 16.8313 9.74905C16.8313 13.0628 14.077 15.7485 10.6678 15.7485Z"
      fill={theme.colors.background}
    />
  </Svg>
);
const IconArrow = ({ fill }: { fill: string }) => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 16 18"
    fill="none"
  >
    <Path
      d="M6.80281 1.67952L7.59558 0.820102C7.93126 0.456206 8.47405 0.456206 8.80616 0.820102L15.7482 8.3419C16.0839 8.7058 16.0839 9.29423 15.7482 9.65425L8.80616 17.1799C8.47048 17.5438 7.92769 17.5438 7.59558 17.1799L6.80281 16.3205C6.46356 15.9527 6.47071 15.3527 6.8171 14.9927L11.1202 10.5485H0.857047C0.3821 10.5485 0 10.1343 0 9.61941V8.38062C0 7.86574 0.3821 7.45152 0.857047 7.45152H11.1202L6.8171 3.00735C6.46714 2.64732 6.45999 2.04728 6.80281 1.67952Z"
      fill={fill}
    />
  </Svg>
);

const icons: Record<string, (props: { fill: string; style?: any }) => JSX.Element> = {
  search: IconSearch,
  arrow: IconArrow,
};

const getIconFill = (status: ButtonStatus) => {
  switch (status) {
    case "active":
      return theme.colors.textHilight;
    case "disabled":
      return theme.colors.lightGrey;
    default:
      return theme.colors.textAlternative;
  }
};

export default function ThemedButton({
  type = "main",
  size = "large",
  disabled = false,
  icon = "void",
  status = "default",
  width,
  title,
  style,
  ...rest
}: ThemedButtonProps & { title: string }) {
  const IconComponent = icon !== "void" && icons[icon] ? icons[icon] : null;
  const hasIcon = icon !== "void" && !!IconComponent;
  const buttonStyle = createButtonStyle(type, size, status, hasIcon);
  const containerStyle = [buttonStyle.container, style].filter(Boolean);
  const textStyle = [hasIcon && buttonStyle.textWithIcon ? buttonStyle.textWithIcon : buttonStyle.text].filter(Boolean);
  const iconContainerStyle = [buttonStyle.icon].filter(Boolean);
  const iconFill = getIconFill(status);

  // Select background image based on status/type
  let backgroundImage = null;
  if (disabled || status === "disabled") {
    backgroundImage = require("@/assets/button-disabled-background.webp");
  } else if (type === "main") {
    backgroundImage = require("@/assets/button-main-background.webp");
  } else if (type === "alternative") {
    backgroundImage = require("@/assets/button-alt-background.webp");
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[containerStyle, width ? { width: width } : {}]}
      disabled={disabled || status === "disabled"}
      {...rest}
    >
      {backgroundImage && (
        <Image
          source={backgroundImage}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 8,
            zIndex: 0,
          }}
          contentFit="cover"
          pointerEvents="none"
        />
      )}
      {IconComponent ? (
        <View style={[iconContainerStyle]}>
          <IconComponent fill={iconFill} />
        </View>
      ) : null}
      <ThemedText
        style={[textStyle]}
        type={size === "large" ? "button" : "buttonSmall"}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}
