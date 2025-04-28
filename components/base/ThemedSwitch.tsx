import React from "react";
import { Switch, SwitchProps } from "react-native";
import { theme } from "@/style/ui/Theme";

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
      trackColor={{ false: theme.colors.lightGrey, true: theme.colors.lightGrey }}
      thumbColor={value ? theme.colors.green : theme.colors.purple}
      {...rest}
    />
  );
};

export default ThemedSwitch;
