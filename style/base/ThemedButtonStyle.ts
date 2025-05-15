import { theme } from "@/style/ui/Theme";

export type ButtonType = "main" | "alternative" | "outline";
export type ButtonSize = "small" | "large";
export type ButtonStatus = "default" | "active" | "disabled";

// Factory function for button styles
export function createButtonStyle(type: ButtonType, size: ButtonSize, status: ButtonStatus, hasIcon: boolean) {
  // Shared values
  const borderRadius = theme.borderRadius.large;
  const paddingVertical = size === "large" ? theme.padding.medium : theme.padding.small;
  const paddingHorizontal = size === "large" ? theme.padding.large : theme.padding.large;
  let iconSize = size === "large" ? theme.padding.medium : theme.padding.small;
  const textWithIconMargin = size === "large" ? theme.padding.small : theme.padding.xsmall;

  // Base container
  let container: any = {
    borderRadius,
    paddingVertical,
    paddingHorizontal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.padding.xsmall,
    backgroundColor:
      type === "main"
        ? theme.colors.purple
        : type === "alternative"
        ? "transparent"
        : type === "outline"
        ? theme.colors.mediumGrey
        : undefined,
    boxShadow:
      type === "main"
        ? [
            {
              color: theme.colors.shadowDark,
              offsetX: 6,
              offsetY: 6,
              blurRadius: "12px",
            },
            {
              offsetX: 1,
              offsetY: 2,
              blurRadius: "2px",
              color: theme.colors.shadowLightPurlple,
              inset: true,
            },
          ]
        : type === "outline"
        ? [
            {
              color: theme.colors.shadowDark,
              offsetX: 0,
              offsetY: 2,
              blurRadius: "4px",
            },
          ]
        : undefined,
  };

  // Outline special case
  if (type === "outline") {
    container = {
      ...container,
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor:
        status === "active"
          ? theme.colors.purple
          : status === "disabled"
          ? theme.colors.lightGrey
          : theme.colors.purple,
      opacity: status === "disabled" ? 1 : 1,
      paddingHorizontal: theme.padding.small,
    };
    iconSize = theme.padding.small;
  }

  // Text color
  let textColor = theme.colors.grey;
  if (type !== "outline") {
    textColor = status !== "disabled" ? theme.colors.white : theme.colors.grey;
  }

  // Icon style
  const icon = { width: iconSize, height: iconSize, zIndex: 1 };

  // containerWithIcon
  const containerWithIcon = {
    ...container,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  // textWithIcon
  const textWithIcon = { color: textColor, marginLeft: hasIcon ? textWithIconMargin : 0, zIndex: 1 };

  return {
    container: hasIcon ? containerWithIcon : container,
    text: { color: textColor, zIndex: 1 },
    icon,
    textWithIcon: hasIcon ? textWithIcon : undefined,
  };
}
