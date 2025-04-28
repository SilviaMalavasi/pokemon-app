import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";

import styles from "@/style/base/ThemedModalStyle";

interface CardTypeModalProps {
  visible: boolean;
  onClose: () => void;
  cardSupertype: string[];
  setCardSupertype: (val: string[]) => void;
  cardSubtypes: string[];
  setCardSubtypes: (val: string[]) => void;
  cardTypes: string[];
  setCardTypes: (val: string[]) => void;
}

export default function CardTypeModal({
  visible,
  onClose,
  cardSupertype,
  setCardSupertype,
  cardSubtypes,
  setCardSubtypes,
  cardTypes,
  setCardTypes,
}: CardTypeModalProps) {
  const cardSupertypeOptions = uniqueIdentifiers.cardSupertype.map((v: string) => ({ value: v, label: v }));

  const allSubtypes = Array.from(
    new Set([
      ...(uniqueIdentifiers.cardSubtypePokémon || []),
      ...(uniqueIdentifiers.cardSubtypeTrainer || []),
      ...(uniqueIdentifiers.cardSubtypeEnergy || []),
    ])
  );

  const getCardSubtypesOptions = (supertypes: string[]) => {
    let subtypeSet = new Set<string>();

    if (!supertypes || supertypes.length === 0) {
      allSubtypes.forEach((v) => subtypeSet.add(v));
    } else {
      supertypes.forEach((supertype) => {
        if (supertype === "Pokémon" && uniqueIdentifiers.cardSubtypePokémon) {
          uniqueIdentifiers.cardSubtypePokémon.forEach((v: string) => subtypeSet.add(v));
        } else if (supertype === "Trainer" && uniqueIdentifiers.cardSubtypeTrainer) {
          uniqueIdentifiers.cardSubtypeTrainer.forEach((v: string) => subtypeSet.add(v));
        } else if (supertype === "Energy" && uniqueIdentifiers.cardSubtypeEnergy) {
          uniqueIdentifiers.cardSubtypeEnergy.forEach((v: string) => subtypeSet.add(v));
        }
      });
    }
    return Array.from(subtypeSet).map((v) => ({ value: v, label: v }));
  };

  const cardSubtypesOptions = getCardSubtypesOptions(cardSupertype);

  const cardTypesOptions = uniqueIdentifiers.cardTypes.map((v: string) => ({ value: v, label: v }));

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
              <DynamicMultiSelect
                label="Supertype"
                value={cardSupertype}
                options={cardSupertypeOptions}
                onChange={setCardSupertype}
                labelHint="Include cards that match ANY of the selected choices."
              />
              <DynamicMultiSelect
                label="Subtypes"
                value={cardSubtypes}
                options={cardSubtypesOptions}
                onChange={setCardSubtypes}
                labelHint="Include cards that match ANY of the selected choices."
              />
              {(cardSupertype.length === 0 ||
                cardSupertype.includes("Pokémon") ||
                cardSupertype.includes("Energy")) && (
                <DynamicMultiSelect
                  label="Types"
                  value={cardTypes}
                  options={cardTypesOptions}
                  onChange={setCardTypes}
                  labelHint="Include cards that match ANY of the selected choices."
                />
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
