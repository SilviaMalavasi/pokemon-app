import { vw } from "@/helpers/viewport";

export const white = "#ffffff";
export const black = "#000000";
export const grey = "#ABADB3";

export const background = "#1B1C21";
export const darkGrey = "#191A20";
export const mediumGrey = "#242832";
export const lightGrey = "#2B3141";

export const purple = "#9142FF";
export const green = "#4FFFCA";

export const shadowLight = "#2E3644";
export const shadowDark = "rgba(25, 26, 32, 0.5)";
export const shadowLightPurlple = "#9D6AE3";
export const shadowPurple = "rgba(61, 16, 124, 0.65)";

export const theme = {
  colors: {
    white: white,
    black: black,
    grey: grey,

    background: background,
    darkGrey: darkGrey,
    mediumGrey: mediumGrey,
    lightGrey: lightGrey,

    purple: purple,
    green: green,
  },
  fontSizes: {
    font36: vw(9),
    font28: vw(7),
    font24: vw(6),
    font18: vw(4.5),
    font16: vw(4),
    font15: vw(3.8),
    font14: vw(3.5),
  },
  padding: {
    none: 0,
    xsmall: vw(2),
    small: vw(4),
    medium: vw(6),
    large: vw(8),
    xlarge: vw(10),
  },
  borderRadius: {
    none: 0,
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
  },
  shadow: {
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  shadowAlternative: {
    shadowColor: purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  shadowSmall: {
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 4,
  },
};
