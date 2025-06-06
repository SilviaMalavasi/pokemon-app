import React from "react";
import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import { ActivityIndicator, View } from "react-native";
import ExternalLink from "@/components/base/ExternalLink";
import { LimitlessDatabaseProvider, useLimitlessDatabase } from "@/components/context/LimitlessDatabaseContext";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { theme } from "@/style/ui/Theme";
import DeckLibraryCategoryList from "@/components/decklibrary/DeckLibraryCategoryList";

function DeckLibraryContent() {
  const { db, isLoading, isUpdating, error } = useLimitlessDatabase();
  const {
    db: userDb,
    isLoading: isUserDbLoading,
    isUpdating: isUserDbUpdating,
    error: userDbError,
  } = useUserDatabase();

  if (error || userDbError) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle="Deck Library"
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ThemedText>Error loading database: {error?.message || userDbError?.message}</ThemedText>
        </View>
      </MainScrollView>
    );
  }
  if (!db || isLoading || isUpdating || !userDb || isUserDbLoading || isUserDbUpdating) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle="Deck Library"
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ActivityIndicator
            size="large"
            color={theme.colors.purple}
          />
        </View>
      </MainScrollView>
    );
  }

  // Show category list at the top
  return (
    <MainScrollView
      headerImage="deck-library-bkg"
      headerTitle="Deck Library"
    >
      <View style={{ paddingHorizontal: theme.padding.large, paddingVertical: theme.padding.medium }}>
        <ThemedText
          type="default"
          color={theme.colors.grey}
        >
          <ThemedText
            fontWeight="bold"
            color={theme.colors.grey}
          >
            Last Decks Update:{" "}
          </ThemedText>
          27/05/2025
        </ThemedText>
        <ThemedText>
          Credits goes to <ExternalLink href="https://limitlesstcg.com/">limitlesstcg.com</ExternalLink>
        </ThemedText>
      </View>
      <DeckLibraryCategoryList />
    </MainScrollView>
  );
}

export default function DeckLibraryScreen() {
  return (
    <LimitlessDatabaseProvider>
      <DeckLibraryContent />
    </LimitlessDatabaseProvider>
  );
}
