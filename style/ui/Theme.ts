import { vw } from "@/helpers/viewport";

export const white = "#ffffff";
export const grey = "#ABADB3";
export const black = "#000000";

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

export const lightGreen = "#41F8A3"; //old
export const lightPurple = "#C374FF"; //old

export const theme = {
  colors: {
    background: darkGrey,
    lightBackground: mediumGrey,
    text: white,
    textDark: lightGrey,
    textHilight: green,
    textAlternative: lightPurple,
    placeholder: grey,
    primary: green,
    secondary: purple,
    black: black,
    white: white,
    grey: grey,
    darkGrey: darkGrey,
    mediumGrey: mediumGrey,
    lightGrey: lightGrey,
    green: green,
    lightGreen: lightGreen,
    purple: purple,
    lightPurple: lightPurple,
  },
  padding: {
    none: 0,
    xsmall: vw(2),
    small: vw(4),
    medium: vw(6),
    large: vw(8),
    xlarge: vw(10),
  },
  fontSizes: {
    xxsmall: vw(2.7),
    xsmall: vw(3),
    small: vw(3.8),
    medium: vw(4.5),
    large: vw(6.5),
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
    shadowColor: lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  shadowAlternative: {
    shadowColor: lightPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  shadowSmall: {
    shadowColor: lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 4,
  },
};
