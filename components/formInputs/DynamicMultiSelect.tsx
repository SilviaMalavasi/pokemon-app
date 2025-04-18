import React from "react";

interface DynamicMultiSelectProps {
  label?: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
}

const DynamicMultiSelect: React.FC<DynamicMultiSelectProps> = ({ label, value, options, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    onChange(selected);
  };
  return (
    <label>
      {label && <span>{label}</span>}
      <select
        multiple
        value={value}
        onChange={handleChange}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default DynamicMultiSelect;
