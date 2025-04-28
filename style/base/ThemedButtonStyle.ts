import { theme } from "@/style/ui/Theme";

export type ButtonType = "main" | "alternative" | "outline";
export type ButtonSize = "small" | "large";
export type ButtonStatus = "default" | "active" | "disabled";

// Optionally extend ButtonStyle for icon-aware styles
export type ButtonStyle = {
  container: object;
  text: object;
  icon: object;
  containerWithIcon?: object;
  textWithIcon?: object;
};

export type ThemedButtonStyle = {
  [K in ButtonType]: {
    [S in ButtonSize]: {
      [T in ButtonStatus]: ButtonStyle;
    };
  };
};

// Shared size and flexbox styles
const sharedSizeStyles = {
  small: {
    container: { padding: theme.padding.small },
    iconContainer: { width: theme.padding.small, height: theme.padding.small },
  },
  large: {
    container: { padding: theme.padding.medium },
    iconContainer: { width: theme.padding.medium, height: theme.padding.medium },
  },
};

const sharedFlexWithIcon = {
  containerWithIcon: { flexDirection: "row", alignItems: "center" },
  textWithIcon: { marginLeft: 8 },
};

export function getButtonStyle(
  type: ButtonType,
  size: ButtonSize,
  status: ButtonStatus,
  hasIcon: boolean
): { container: object; text: object; icon: object } {
  const base = styles[type][size][status];
  return {
    container: hasIcon && base.containerWithIcon ? base.containerWithIcon : base.container,
    text: hasIcon && base.textWithIcon ? base.textWithIcon : base.text,
    icon: base.icon,
  };
}

const styles: ThemedButtonStyle = {
  main: {
    large: {
      default: {
        container: {
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-ExtraBold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
      active: {
        container: {
          backgroundColor: theme.colors.textHilight,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-ExtraBold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.textHilight,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
      disabled: {
        container: {
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-ExtraBold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          opacity: 0.6,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
    },
    small: {
      default: {
        container: {
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
      active: {
        container: {
          backgroundColor: theme.colors.textHilight,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.textHilight,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
      disabled: {
        container: {
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          opacity: 0.6,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
    },
  },
  alternative: {
    large: {
      default: {
        container: {
          backgroundColor: theme.colors.secondary,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.secondary,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
      active: {
        container: {
          backgroundColor: theme.colors.purple,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.purple,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
      disabled: {
        container: {
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          opacity: 0.6,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
    },
    small: {
      default: {
        container: {
          backgroundColor: theme.colors.secondary,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.secondary,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
      active: {
        container: {
          backgroundColor: theme.colors.purple,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.purple,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
      disabled: {
        container: {
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.background,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          opacity: 0.6,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
    },
  },
  outline: {
    large: {
      default: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
        },
        text: {
          color: theme.colors.primary,
          fontFamily: "Inter-ExtraBold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
      active: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
        },
        text: {
          color: theme.colors.textHilight,
          fontFamily: "Inter-ExtraBold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
      disabled: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.lightGrey,
          fontFamily: "Inter-ExtraBold",
          fontSize: theme.fontSizes.medium,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.medium,
          height: theme.padding.medium,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.medium,
          paddingHorizontal: theme.padding.large,
          opacity: 0.6,
        },
        textWithIcon: {
          marginLeft: 8,
        },
      },
    },
    small: {
      default: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
        },
        text: {
          color: theme.colors.primary,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
      active: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
        },
        text: {
          color: theme.colors.textHilight,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
      disabled: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.lightGrey,
          fontFamily: "Inter-Bold",
          fontSize: theme.fontSizes.small,
          textTransform: "uppercase",
        },
        icon: {
          width: theme.padding.small,
          height: theme.padding.small,
        },
        containerWithIcon: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          borderRadius: 8,
          paddingVertical: theme.padding.small,
          paddingHorizontal: theme.padding.medium,
          opacity: 0.6,
        },
        textWithIcon: {
          marginLeft: 6,
        },
      },
    },
  },
};

export default styles;
