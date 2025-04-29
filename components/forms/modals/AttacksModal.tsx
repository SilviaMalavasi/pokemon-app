import React from "react";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import NumberInput from "@/components/base/NumberInput";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";
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
  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      buttonText="set filters"
      buttonType="alternative"
      buttonSize="small"
    >
      <ThemedText
        type="subtitle"
        style={{ width: "100%", paddingBottom: theme.padding.medium }}
      >
        Attacks
      </ThemedText>
      <ThemedTextInput
        label="Attack Name"
        value={attacksName}
        onChange={setAttacksName}
        placeholder="Attack name"
      />
      <NumberInput
        label="Attack Damage"
        value={attacksDamage}
        onChange={(val, op) => {
          setAttacksDamage(val);
          setAttacksDamageOperator(op);
        }}
        placeholder="Attack damage"
        showOperatorSelect={"advanced"}
      />
      <AutoCompleteInput
        label="Attack Text"
        value={attacksText}
        onChange={setAttacksText}
        suggestions={["search", "discard pile", "attach", "energy"]}
        placeholder="Attack text"
      />
      <NumberInput
        label="Attacks Converted Energy Cost"
        value={attacksConvertedEnergyCost}
        onChange={(val, op) => {
          setAttacksConvertedEnergyCost(val);
          setAttacksConvertedEnergyCostOperator(op);
        }}
        placeholder="Converted energy cost"
        showOperatorSelect={"basic"}
      />
      {(!attacksConvertedEnergyCostOperator ||
        !attacksConvertedEnergyCost ||
        attacksConvertedEnergyCostOperator !== "=") && (
        <DynamicMultiSelect
          label="Attack Cost"
          value={attacksCost}
          options={energyTypesOptions}
          onChange={setAttacksCost}
          labelHint="Include cards that match ANY of the selected choices."
        />
      )}
      {attacksConvertedEnergyCostOperator === "=" &&
        attacksConvertedEnergyCost &&
        Number(attacksConvertedEnergyCost) > 0 && (
          <>
            {Array.from({ length: Number(attacksConvertedEnergyCost) }).map((_, idx) => (
              <DynamicMultiSelect
                key={idx}
                label={`Attack Cost Slot ${idx + 1}`}
                value={attacksCostSlots[idx] ? [attacksCostSlots[idx]] : []}
                options={energyTypesOptions}
                onChange={(items) => {
                  const newSlots = [...attacksCostSlots];
                  newSlots[idx] = items[0] || "";
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
