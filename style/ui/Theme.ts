import { vw } from "@/helpers/viewport";

export const white = "#ffffff";
export const grey = "#676776";
export const black = "#000000";

export const darkGrey = "#111218";
export const mediumGrey = "#171926";
export const lightGrey = "#4D4E70";
export const lightPurple = "#8249F2";

export const green = "#30F51B";
export const lightGreen = "#41F8A3";
export const purple = "#6a1dff";

export const theme = {
  colors: {
    background: darkGrey,
    lightBackground: mediumGrey,
    text: white,
    textDark: lightGrey,
    textHilight: green,
    textAlternative: purple,
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
};
