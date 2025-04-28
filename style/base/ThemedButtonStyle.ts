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

// Shared container and containerWithIcon for DRYness
const sharedFlexWithIcon = {
  flexDirection: "row",
  alignItems: "center",
};
const sharedContainer = {
  small: {
    borderRadius: shared.small.borderRadius,
    paddingVertical: shared.small.paddingVertical,
    paddingHorizontal: shared.small.paddingHorizontal,
    alignItems: "center",
  },
  large: {
    borderRadius: shared.large.borderRadius,
    paddingVertical: shared.large.paddingVertical,
    paddingHorizontal: shared.large.paddingHorizontal,
    alignItems: "center",
  },
};
const sharedContainerWithIcon = {
  small: {
    ...sharedContainer.small,
    ...sharedFlexWithIcon,
  },
  large: {
    ...sharedContainer.large,
    ...sharedFlexWithIcon,
  },
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
        container: sharedContainer.large,
        text: { color: theme.colors.background },
        icon: shared.large.icon,
        containerWithIcon: sharedContainerWithIcon.large,
        textWithIcon: shared.large.textWithIcon,
      },
      active: {
        container: sharedContainer.large,
        text: { color: theme.colors.background },
        icon: shared.large.icon,
        containerWithIcon: sharedContainerWithIcon.large,
        textWithIcon: shared.large.textWithIcon,
      },
      disabled: {
        container: { ...sharedContainer.large, opacity: 0.6 },
        text: { color: theme.colors.background },
        icon: shared.large.icon,
        containerWithIcon: { ...sharedContainerWithIcon.large, opacity: 0.6 },
        textWithIcon: shared.large.textWithIcon,
      },
    },
    small: {
      default: {
        container: sharedContainer.small,
        text: { color: theme.colors.background },
        icon: shared.small.icon,
        containerWithIcon: sharedContainerWithIcon.small,
        textWithIcon: shared.small.textWithIcon,
      },
      active: {
        container: sharedContainer.small,
        text: { color: theme.colors.background },
        icon: shared.small.icon,
        containerWithIcon: sharedContainerWithIcon.small,
        textWithIcon: shared.small.textWithIcon,
      },
      disabled: {
        container: { ...sharedContainer.small, opacity: 0.6 },
        text: { color: theme.colors.background },
        icon: shared.small.icon,
        containerWithIcon: { ...sharedContainerWithIcon.small, opacity: 0.6 },
        textWithIcon: shared.small.textWithIcon,
      },
    },
  },
  alternative: {
    large: {
      default: {
        container: sharedContainer.large,
        text: { color: theme.colors.background },
        icon: shared.large.icon,
        containerWithIcon: sharedContainerWithIcon.large,
        textWithIcon: shared.large.textWithIcon,
      },
      active: {
        container: sharedContainer.large,
        text: { color: theme.colors.background },
        icon: shared.large.icon,
        containerWithIcon: sharedContainerWithIcon.large,
        textWithIcon: shared.large.textWithIcon,
      },
      disabled: {
        container: { ...sharedContainer.large, opacity: 0.6 },
        text: { color: theme.colors.background },
        icon: shared.large.icon,
        containerWithIcon: { ...sharedContainerWithIcon.large, opacity: 0.6 },
        textWithIcon: shared.large.textWithIcon,
      },
    },
    small: {
      default: {
        container: sharedContainer.small,
        text: { color: theme.colors.background },
        icon: shared.small.icon,
        containerWithIcon: sharedContainerWithIcon.small,
        textWithIcon: shared.small.textWithIcon,
      },
      active: {
        container: sharedContainer.small,
        text: { color: theme.colors.background },
        icon: shared.small.icon,
        containerWithIcon: sharedContainerWithIcon.small,
        textWithIcon: shared.small.textWithIcon,
      },
      disabled: {
        container: { ...sharedContainer.small, opacity: 0.6 },
        text: { color: theme.colors.background },
        icon: shared.small.icon,
        containerWithIcon: { ...sharedContainerWithIcon.small, opacity: 0.6 },
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
          ...sharedContainer.large,
        },
        text: { color: theme.colors.primary },
        icon: shared.large.icon,
        containerWithIcon: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          ...sharedContainerWithIcon.large,
        },
        textWithIcon: shared.large.textWithIcon,
      },
      active: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          ...sharedContainer.large,
        },
        text: { color: theme.colors.textHilight },
        icon: shared.large.icon,
        containerWithIcon: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          ...sharedContainerWithIcon.large,
        },
        textWithIcon: shared.large.textWithIcon,
      },
      disabled: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          ...sharedContainer.large,
          opacity: 0.6,
        },
        text: { color: theme.colors.lightGrey },
        icon: shared.large.icon,
        containerWithIcon: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          ...sharedContainerWithIcon.large,
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
          ...sharedContainer.small,
        },
        text: { color: theme.colors.primary },
        icon: shared.small.icon,
        containerWithIcon: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          ...sharedContainerWithIcon.small,
        },
        textWithIcon: shared.small.textWithIcon,
      },
      active: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          ...sharedContainer.small,
        },
        text: { color: theme.colors.textHilight },
        icon: shared.small.icon,
        containerWithIcon: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.textHilight,
          ...sharedContainerWithIcon.small,
        },
        textWithIcon: shared.small.textWithIcon,
      },
      disabled: {
        container: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          ...sharedContainer.small,
          opacity: 0.6,
        },
        text: { color: theme.colors.lightGrey },
        icon: shared.small.icon,
        containerWithIcon: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.lightGrey,
          ...sharedContainerWithIcon.small,
          opacity: 0.6,
        },
        textWithIcon: shared.small.textWithIcon,
      },
    },
  },
};

export default styles;
