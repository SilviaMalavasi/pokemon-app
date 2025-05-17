import { theme } from "@/style/ui/Theme";

export type ButtonType = "main" | "alternative" | "outline";
export type ButtonSize = "small" | "large";
export type ButtonStatus = "default" | "active" | "disabled";

// Factory function for button styles
export function createButtonStyle(type: ButtonType, size: ButtonSize, status: ButtonStatus, hasIcon: boolean) {
  // Shared values
  const borderRadius = theme.borderRadius.large;
  const paddingVertical =
    type === "alternative" && size === "small"
      ? theme.padding.xsmall
      : size === "large"
      ? theme.padding.medium
      : theme.padding.small;
  const paddingHorizontal = theme.padding.large;
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
        ? status === "disabled"
          ? theme.colors.lightGrey
          : theme.colors.mediumGrey
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
              color: status === "disabled" ? theme.colors.shadowLight : theme.colors.shadowLightPurlple,
              inset: true,
            },
          ]
        : type === "outline"
        ? [
            {
              color: theme.colors.shadowLight,
              offsetX: -2,
              offsetY: -2,
              blurRadius: "12px",
            },
            {
              color: theme.colors.darkGrey,
              offsetX: 4,
              offsetY: 4,
              blurRadius: "12px",
            },
          ]
        : undefined,
  };

  // Text color
  let textColor = theme.colors.grey;
  if (type === "outline") {
    textColor = theme.colors.grey;
  }
  if (type === "main") {
    textColor = status === "disabled" ? theme.colors.grey : theme.colors.white;
  }
  if (type === "alternative") {
    textColor = status === "disabled" ? theme.colors.grey : theme.colors.green;
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
