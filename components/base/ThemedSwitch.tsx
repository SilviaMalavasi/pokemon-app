import React from "react";
import { Switch, SwitchProps } from "react-native";
import { Colors } from "@/style/base/Colors";

interface ThemedSwitchProps extends SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const ThemedSwitch: React.FC<ThemedSwitchProps> = ({ value, onValueChange, disabled = false, ...rest }) => {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: Colors.mediumGrey, true: Colors.mediumDarkGrey }}
      thumbColor={value ? Colors.green : Colors.purple}
      {...rest}
    />
  );
};

export default ThemedSwitch;
