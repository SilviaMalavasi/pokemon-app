import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/base/ThemedModalStyle";

interface AbilitiesModalProps {
  visible: boolean;
  onClose: () => void;
  abilitiesName: string;
  setAbilitiesName: (val: string) => void;
  abilitiesText: string;
  setAbilitiesText: (val: string) => void;
  hasAnyAbility: boolean;
  setHasAnyAbility: (val: boolean) => void;
}

export default function AbilitiesModal({
  visible,
  onClose,
  abilitiesName,
  setAbilitiesName,
  abilitiesText,
  setAbilitiesText,
  hasAnyAbility,
  setHasAnyAbility,
}: AbilitiesModalProps) {
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
                label="Abilities Name"
                value={abilitiesName}
                onChange={setAbilitiesName}
                placeholder="Ability name"
              />
              <AutoCompleteInput
                label="Abilities Text"
                value={abilitiesText}
                onChange={setAbilitiesText}
                suggestions={["search", "discard pile", "attach", "energy"]}
                placeholder="Ability text"
              />
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                <ThemedSwitch
                  value={hasAnyAbility}
                  onValueChange={setHasAnyAbility}
                />
                <ThemedText
                  type="default"
                  style={{ paddingLeft: 8 }}
                >
                  Has any ability
                </ThemedText>
              </ThemedView>
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

export function getAbilitiesFilters(abilitiesName: string, abilitiesText: string, hasAnyAbility: boolean) {
  return [
    abilitiesName && {
      config: { key: "abilityName", type: "text", table: "Abilities", column: "name" },
      value: abilitiesName,
    },
    abilitiesText && {
      config: { key: "abilityText", type: "text", table: "Abilities", column: "text" },
      value: abilitiesText,
    },
    hasAnyAbility && {
      config: { key: "hasAnyAbility", type: "exists", table: "CardAbilities", column: "cardId" },
      value: true,
    },
  ].filter(Boolean);
}
