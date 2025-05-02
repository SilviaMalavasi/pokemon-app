import { theme } from "@/style/ui/Theme";

export type ButtonType = "main" | "alternative" | "outline";
export type ButtonSize = "small" | "large";
export type ButtonStatus = "default" | "active" | "disabled";

// Factory function for button styles
export function createButtonStyle(type: ButtonType, size: ButtonSize, status: ButtonStatus, hasIcon: boolean) {
  // Shared values
  const borderRadius = theme.borderRadius.medium;
  const paddingVertical = size === "large" ? theme.padding.small : theme.padding.xsmall;
  const paddingHorizontal = size === "large" ? theme.padding.medium : theme.padding.small;
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
    };
    iconSize = theme.padding.small;
  }

  // Text color
  let textColor = theme.colors.background;
  if (type === "outline") {
    textColor =
      status === "active"
        ? theme.colors.textHilight
        : status === "disabled"
        ? theme.colors.lightGrey
        : theme.colors.text;
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
