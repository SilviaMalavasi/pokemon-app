import { vw } from "@/helpers/viewport";

export const white = "rgb(255, 255, 255)";
export const black = "rgb(0, 0, 0)";
export const grey = "rgb(171, 173, 179)";

export const background = "rgb(25, 29, 42)";
export const darkGrey = "rgb(10, 13, 22)";
export const mediumGrey = "rgb(36, 40, 50)";
export const lightGrey = "rgb(48, 55, 78)";

export const purple = "rgb(145, 66, 255)";
export const green = "rgb(79, 255, 202)";

export const shadowLight = "rgb(46, 54, 68)";
export const shadowDark = "rgba(5, 5, 12, 0.8)";
export const shadowLightPurlple = "rgb(157, 106, 227)";
export const shadowPurple = "rgba(61, 16, 124, 0.65)";
export const shadowInsetLight = "rgba(255, 255, 255, 0.1)";

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

    shadowLight: shadowLight,
    shadowDark: shadowDark,
    shadowLightPurlple: shadowLightPurlple,
    shadowPurple: shadowPurple,
    shadowInsetLight: shadowInsetLight,
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
    xlarge: 24,
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
