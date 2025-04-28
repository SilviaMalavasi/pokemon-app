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

// Shared style variables for DRYness
const shared = {
  small: {
    paddingHorizontal: theme.padding.medium,
    paddingVertical: theme.padding.small,
    borderRadius: 8,
    icon: { width: theme.padding.small, height: theme.padding.small },
    textWithIcon: { marginLeft: 6 },
  },
  large: {
    paddingHorizontal: theme.padding.large,
    paddingVertical: theme.padding.medium,
    borderRadius: 8,
    icon: { width: theme.padding.medium, height: theme.padding.medium },
    textWithIcon: { marginLeft: 8 },
  },
};

const sharedContainerWithIcon = {
  flexDirection: "row",
  alignItems: "center",
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
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
        },
        textWithIcon: shared.large.textWithIcon,
      },
      active: {
        container: {
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
        },
        textWithIcon: shared.large.textWithIcon,
      },
      disabled: {
        container: {
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          opacity: 0.6,
        },
        textWithIcon: shared.large.textWithIcon,
      },
    },
    small: {
      default: {
        container: {
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
        },
        textWithIcon: shared.small.textWithIcon,
      },
      active: {
        container: {
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
        },
        textWithIcon: shared.small.textWithIcon,
      },
      disabled: {
        container: {
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          opacity: 0.6,
        },
        textWithIcon: shared.small.textWithIcon,
      },
    },
  },
  alternative: {
    large: {
      default: {
        container: {
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
        },
        textWithIcon: shared.large.textWithIcon,
      },
      active: {
        container: {
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
        },
        textWithIcon: shared.large.textWithIcon,
      },
      disabled: {
        container: {
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          opacity: 0.6,
        },
        textWithIcon: shared.large.textWithIcon,
      },
    },
    small: {
      default: {
        container: {
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
        },
        textWithIcon: shared.small.textWithIcon,
      },
      active: {
        container: {
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
        },
        textWithIcon: shared.small.textWithIcon,
      },
      disabled: {
        container: {
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.background,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          opacity: 0.6,
        },
        textWithIcon: shared.small.textWithIcon,
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
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.primary,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
        },
        textWithIcon: shared.large.textWithIcon,
      },
      active: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.textHilight,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
        },
        textWithIcon: shared.large.textWithIcon,
      },
      disabled: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.lightGrey,
        },
        icon: shared.large.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          borderRadius: shared.large.borderRadius,
          paddingVertical: shared.large.paddingVertical,
          paddingHorizontal: shared.large.paddingHorizontal,
          opacity: 0.6,
        },
        textWithIcon: shared.large.textWithIcon,
      },
    },
    small: {
      default: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.primary,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
        },
        textWithIcon: shared.small.textWithIcon,
      },
      active: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
        },
        text: {
          color: theme.colors.textHilight,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
        },
        textWithIcon: shared.small.textWithIcon,
      },
      disabled: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          alignItems: "center",
          opacity: 0.6,
        },
        text: {
          color: theme.colors.lightGrey,
        },
        icon: shared.small.icon,
        containerWithIcon: {
          ...sharedContainerWithIcon,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          borderRadius: shared.small.borderRadius,
          paddingVertical: shared.small.paddingVertical,
          paddingHorizontal: shared.small.paddingHorizontal,
          opacity: 0.6,
        },
        textWithIcon: shared.small.textWithIcon,
      },
    },
  },
};

export default styles;
