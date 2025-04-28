import React from "react";
import { Modal, SafeAreaView, View, Pressable } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
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
  cardSupertypeOptions: { value: string; label: string }[];
  cardSubtypesOptions: { value: string; label: string }[];
  cardTypesOptions: { value: string; label: string }[];
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
  cardSupertypeOptions,
  cardSubtypesOptions,
  cardTypesOptions,
}: CardTypeModalProps) {
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
