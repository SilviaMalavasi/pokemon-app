import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import { useRouter } from "expo-router";
import { theme } from "@/style/ui/Theme";
import deckLibraryMapping from "@/helpers/deckLibraryMapping";
import cardImageMapping from "@/helpers/cardImageMapping";

export default function DeckLibraryCategoryList() {
  const router = useRouter();
  const categories = Object.entries(deckLibraryMapping);

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", padding: theme.padding.large }}>
      {categories.map(([variantOf, { thumbnail }]) => (
        <TouchableOpacity
          key={variantOf}
          style={{
            width: 140,
            margin: theme.padding.small,
            alignItems: "center",
            backgroundColor: theme.colors.darkGrey,
            borderRadius: 12,
            padding: theme.padding.medium,
            shadowColor: theme.colors.black,
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => router.push(`/deckslibrary/variants/${encodeURIComponent(variantOf)}`)}
        >
          <Image
            source={cardImageMapping[thumbnail]}
            style={{ width: 80, height: 110, borderRadius: 8, marginBottom: theme.padding.small }}
            resizeMode="cover"
          />
          <ThemedText
            fontWeight="bold"
            style={{ textAlign: "center" }}
          >
            {variantOf}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}
