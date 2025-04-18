import React from "react";
import Select from "react-select";

interface DynamicMultiSelectProps {
  label?: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
}

const DynamicMultiSelect: React.FC<DynamicMultiSelectProps> = ({ label, value, options, onChange }) => {
  const handleChange = (selected: readonly { value: string; label: string }[] | null) => {
    onChange(selected ? Array.from(selected).map((opt) => opt.value) : []);
  };
  return (
    <label>
      {label && <span>{label}</span>}
      <Select
        instanceId={label || "dynamic-multiselect"}
        isMulti
        value={options.filter((opt) => value.includes(opt.value))}
        options={options}
        onChange={handleChange}
        closeMenuOnSelect={true}
        classNamePrefix="react-select"
      />
    </label>
  );
};

export default DynamicMultiSelect;
