import React from "react";

interface NumberInputProps {
  label?: string;
  value: number | "";
  onChange: (value: number | "") => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, placeholder, min, max, step }) => (
  <label>
    {label && <span>{label}</span>}
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? "" : Number(val));
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
    />
  </label>
);

export default NumberInput;
