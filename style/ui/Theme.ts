import { vw } from "@/helpers/viewport";

export const white = "#ffffff";
export const grey = "#3C3C47";
export const black = "#000000";

export const darkGrey = "#111218";
export const mediumGrey = "#171926";
export const lightGrey = "#6C6C81";

export const green = "#30F51B";
export const purple = "#6a1dff";

export const theme = {
  colors: {
    background: darkGrey,
    lightBackground: mediumGrey,
    text: white,
    textDark: lightGrey,
    textHilight: green,
    textAlternative: purple,
    primary: green,
    secondary: purple,
    black: black,
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
    small: vw(4),
    medium: vw(5),
    large: vw(7),
    xlarge: vw(10),
  },
  borderRadius: {
    none: 0,
    small: 4,
    medium: 8,
    large: 12,
  },
};
