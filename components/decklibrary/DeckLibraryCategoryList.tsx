import React from "react";
import { View } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import { useRouter } from "expo-router";
import { theme } from "@/style/ui/Theme";
import deckLibraryMapping from "@/helpers/deckLibraryMapping";
import CompactDeckLibrary from "@/components/decklibrary/CompactDeckLibrary";

export default function DeckLibraryCategoryList() {
  const router = useRouter();
  const categories = Object.entries(deckLibraryMapping);

  return (
    <ThemedView style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <View style={{ paddingVertical: theme.padding.medium }}>
        {categories.map(([variantOf, { thumbnail }]) => (
          <CompactDeckLibrary
            key={variantOf}
            variantOf={variantOf}
            thumbnail={thumbnail}
            router={router}
            layout="list"
          />
        ))}
      </View>
    </ThemedView>
  );
}
