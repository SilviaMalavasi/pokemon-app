import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import NumberInput from "@/components/base/NumberInput";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import { Dropdown } from "react-native-element-dropdown";
import styles from "@/style/base/ThemedModalStyle";
import dynamicMultiSelectStyle from "@/style/base/DynamicMultiSelectStyle";
import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable
          style={styles.overlay}
          onPress={onClose}
        >
          <View
            style={styles.centeredView}
            pointerEvents="box-none"
          >
            <ThemedView style={styles.modalView}>
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
                      <Dropdown
                        key={idx}
                        style={{ marginVertical: 8 }}
                        data={energyTypesOptions}
                        labelField="label"
                        valueField="value"
                        placeholder="Select type"
                        containerStyle={dynamicMultiSelectStyle.listContainer}
                        itemTextStyle={dynamicMultiSelectStyle.listItem}
                        selectedTextStyle={dynamicMultiSelectStyle.selectedItemText}
                        placeholderStyle={dynamicMultiSelectStyle.label}
                        value={attacksCostSlots[idx] || ""}
                        onChange={(item) => {
                          const newSlots = [...attacksCostSlots];
                          newSlots[idx] = item.value;
                          setAttacksCostSlots(newSlots);
                        }}
                      />
                    ))}
                  </>
                )}
              <ThemedButton
                title="Close"
                onPress={onClose}
                style={{ marginTop: 16 }}
              />
            </ThemedView>
          </View>
        </Pressable>
      </SafeAreaView>
    </Modal>
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
