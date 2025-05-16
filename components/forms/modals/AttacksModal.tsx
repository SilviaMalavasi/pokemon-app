import React from "react";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import ThemedNumberInput from "@/components/base/ThemedNumberInput";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import ThemedMultiSelect from "@/components/base/ThemedMultiSelect";
import ThemedSelect from "@/components/base/ThemedSelect";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import uniqueIdentifiers from "@/helpers/uniqueIdentifiers.json";
import { theme } from "@/style/ui/Theme";

interface AttacksModalProps {
  visible: boolean;
  onClose: () => void;
  attacksName: string;
  setAttacksName: (val: string) => void;
  attacksDamage: number | "";
  setAttacksDamage: (val: number | "") => void;
  attacksDamageOperator: string;
  setAttacksDamageOperator: (val: string) => void;
  attacksText: string;
  setAttacksText: (val: string) => void;
  attacksCost: string[];
  setAttacksCost: (val: string[]) => void;
  attacksConvertedEnergyCost: number | "";
  setAttacksConvertedEnergyCost: (val: number | "") => void;
  attacksConvertedEnergyCostOperator: string;
  setAttacksConvertedEnergyCostOperator: (val: string) => void;
  attacksCostSlots: string[];
  setAttacksCostSlots: (val: string[]) => void;
}

export default function AttacksModal({
  visible,
  onClose,
  attacksName,
  setAttacksName,
  attacksDamage,
  setAttacksDamage,
  attacksDamageOperator,
  setAttacksDamageOperator,
  attacksText,
  setAttacksText,
  attacksCost,
  setAttacksCost,
  attacksConvertedEnergyCost,
  setAttacksConvertedEnergyCost,
  attacksConvertedEnergyCostOperator,
  setAttacksConvertedEnergyCostOperator,
  attacksCostSlots,
  setAttacksCostSlots,
}: AttacksModalProps) {
  const energyTypesOptions = uniqueIdentifiers.energyTypes.map((v: string) => ({ value: v, label: v }));

  // Reset all values to their initial state
  const handleCancel = () => {
    setAttacksName("");
    setAttacksDamage("");
    setAttacksDamageOperator("");
    setAttacksText("");
    setAttacksCost([]);
    setAttacksConvertedEnergyCost("");
    setAttacksConvertedEnergyCostOperator("");
    setAttacksCostSlots([]);
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="main"
      buttonSize="large"
      onCancel={handleCancel}
    >
      <ThemedText
        type="h2"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Attacks
      </ThemedText>
      <ThemedTextInput
        value={attacksName}
        onChange={setAttacksName}
        placeholder="Attack Name"
      />
      <ThemedNumberInput
        label="Attack Damage"
        value={attacksDamage}
        onChange={(val, op) => {
          setAttacksDamage(val);
          setAttacksDamageOperator(op);
        }}
        operator={attacksDamageOperator}
        onOperatorChange={setAttacksDamageOperator}
        placeholder="Attack Damage"
        showOperatorSelect={"advanced"}
      />
      <AutoCompleteInput
        value={attacksText}
        onChange={setAttacksText}
        suggestions={["search", "discard pile", "attach", "energy"]}
        placeholder="Attack Text"
      />
      <ThemedNumberInput
        label="Attacks Cost"
        value={attacksConvertedEnergyCost}
        onChange={(val, op) => {
          setAttacksConvertedEnergyCost(val);
          setAttacksConvertedEnergyCostOperator(op);
        }}
        operator={attacksConvertedEnergyCostOperator}
        onOperatorChange={setAttacksConvertedEnergyCostOperator}
        placeholder="Attacks Cost"
        showOperatorSelect={"basic"}
      />
      {(!attacksConvertedEnergyCostOperator ||
        !attacksConvertedEnergyCost ||
        attacksConvertedEnergyCostOperator !== "=") && (
        <ThemedMultiSelect
          value={attacksCost}
          options={energyTypesOptions}
          onChange={setAttacksCost}
        />
      )}
      {attacksConvertedEnergyCostOperator === "=" &&
        attacksConvertedEnergyCost &&
        Number(attacksConvertedEnergyCost) > 0 && (
          <>
            {Array.from({ length: Number(attacksConvertedEnergyCost) }).map((_, idx) => (
              <ThemedSelect
                key={idx}
                label={`Attack Cost ${idx + 1}`}
                value={attacksCostSlots[idx] || ""}
                options={energyTypesOptions}
                onChange={(selected) => {
                  const newSlots = [...attacksCostSlots];
                  newSlots[idx] = selected || "";
                  setAttacksCostSlots(newSlots);
                }}
                labelHint="Select energy type for this slot."
              />
            ))}
          </>
        )}
    </ThemedModal>
  );
}

export function getAttacksFilters(
  attacksName: string,
  attacksDamage: number | "",
  attacksDamageOperator: string,
  attacksText: string,
  attacksCost: string[],
  attacksConvertedEnergyCost: number | "",
  attacksConvertedEnergyCostOperator: string,
  attacksCostSlots: string[]
) {
  return [
    attacksName && {
      config: { key: "attackName", type: "text", table: "Attacks", column: "name" },
      value: attacksName,
    },
    attacksDamage !== "" && {
      config: { key: "attackDamage", type: "number", table: "CardAttacks", column: "damage", valueType: "text" },
      value: attacksDamage,
      operator: attacksDamageOperator,
    },
    attacksText && {
      config: { key: "attackText", type: "text", table: "Attacks", column: "text" },
      value: attacksText,
    },
    attacksCost.length > 0 && {
      config: { key: "attackCost", type: "multiselect", table: "CardAttacks", column: "cost" },
      value: attacksCost,
    },
    attacksConvertedEnergyCost !== "" && {
      config: {
        key: "attacksConvertedEnergyCost",
        type: "number",
        table: "CardAttacks",
        column: "convertedEnergyCost",
        valueType: "int",
      },
      value: attacksConvertedEnergyCost,
      operator: attacksConvertedEnergyCostOperator,
    },
    attacksConvertedEnergyCostOperator === "=" &&
      attacksConvertedEnergyCost !== "" &&
      attacksCostSlots.length > 0 &&
      attacksCostSlots.some((v) => v) && {
        config: {
          key: "costSlots",
          type: "multiselect",
          table: "CardAttacks",
          column: "cost",
          valueType: "json-string-array",
        },
        value: attacksCostSlots,
      },
  ].filter(Boolean);
}
