import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function vw(percentage: number): number {
  return (screenWidth * percentage) / 100;
}

export function vh(percentage: number): number {
  return (screenHeight * percentage) / 100;
}
