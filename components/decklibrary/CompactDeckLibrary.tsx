import React, { useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import { LinearGradient } from "expo-linear-gradient";
import cardImageMapping from "@/helpers/cardImageMapping";
import styles from "@/style/decklibrary/CompactDeckLibraryStyle";
import { theme } from "@/style/ui/Theme";
import { Router } from "expo-router";
import { useLimitlessDatabase } from "@/components/context/LimitlessDatabaseContext";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";

interface CompactDeckLibraryProps {
  variantOf: string;
  thumbnail: string;
  router: Router;
  layout: "list" | "edit";
  player?: string;
  tournament?: string;
  name?: string;
  id?: number;
  cards?: string;
}

export default function CompactDeckLibrary({
  variantOf,
  thumbnail,
  router,
  layout,
  player,
  tournament,
  name,
  id,
  cards,
}: CompactDeckLibraryProps) {
  const [imageLoading, setImageLoading] = useState(false);
  const { isLoading, isUpdating, error } = useLimitlessDatabase();
  const {
    db: userDb,
    incrementDecksVersion,
    isLoading: isUserDbLoading,
    isUpdating: isUserDbUpdating,
    error: userDbError,
  } = useUserDatabase();

  if (isLoading || isUpdating || isUserDbLoading || isUserDbUpdating) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 120 }}>
        <ActivityIndicator
          size="large"
          color={theme.colors.purple}
        />
      </View>
    );
  }

  if (error || userDbError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 120 }}>
        <ThemedText color={theme.colors.purple}>
          Error loading database: {error?.message || userDbError?.message}
        </ThemedText>
      </View>
    );
  }

  const handleCloneDeck = async () => {
    if (!userDb || !name) return;
    let formattedName = name
      .replace(/\[|\]/g, "")
      .split(",")
      .map((n) => n.trim())
      .map((n) =>
        n
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      )
      .join(" ");
    let baseName = formattedName.replace(/#\d+$/, "").trim();
    let newName = `${baseName} - Cloned`;
    try {
      const { getSavedDecks, addDeck } = await import("@/lib/userDatabase");
      const allDecks = await getSavedDecks(userDb);
      let uniqueName = newName;
      let cloneIndex = 1;
      // Check for existing deck with the same name, and add #1, #2, etc. if needed
      while (allDecks.some((d) => d.name === uniqueName)) {
        uniqueName = `${newName} #${cloneIndex}`;
        cloneIndex++;
      }
      const result = await addDeck(userDb, uniqueName, thumbnail || undefined, cards || "[]");
      console.log("addDeck result:", result);
      let newDeckId: string | number | undefined = undefined;
      if (result && typeof result === "object") {
        if ("insertId" in result && result.insertId != null) {
          newDeckId = result.insertId as string | number;
        } else if ("lastInsertRowId" in result && result.lastInsertRowId != null) {
          newDeckId = result.lastInsertRowId as string | number;
        }
      } else if (typeof result === "string" || typeof result === "number") {
        newDeckId = result;
      }
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
      if (newDeckId) {
        console.log("Navigating to deck:", newDeckId, typeof newDeckId);
        router.replace(`/decks/${String(newDeckId)}`);
      }
    } catch (e) {
      console.error("Failed to clone deck", e);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText
        type="h3"
        color={theme.colors.white}
        style={styles.title}
      >
        {name
          ? name
              .replace(/\[|\]/g, "")
              .split(",")
              .map((n) => n.trim())
              .map((n) =>
                n
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")
              )
              .join(" ")
          : `${variantOf} Decks`}
      </ThemedText>
      <View style={styles.mainContainer}>
        <View style={layout === "edit" ? styles.deckNameEdit : undefined}>
          {player && (
            <ThemedText
              fontWeight="bold"
              color={theme.colors.white}
            >
              {player}
            </ThemedText>
          )}
          {tournament && (
            <ThemedText
              type="buttonAlternativeSmall"
              color={theme.colors.white}
            >
              {tournament}
            </ThemedText>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="View"
            type="main"
            size="small"
            style={{ width: "100%" }}
            onPress={() =>
              layout === "list"
                ? router.push(`/deckslibrary/variants/${encodeURIComponent(variantOf)}`)
                : router.push(`/deckslibrary/${id}`)
            }
          />
          {layout === "edit" && (
            <ThemedButton
              title="Clone"
              type="main"
              size="small"
              style={{ marginTop: theme.padding.xsmall, width: "100%" }}
              onPress={handleCloneDeck}
            />
          )}
        </View>
      </View>
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0)"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.imageOverlay}
        />
        {cardImageMapping[thumbnail] ? (
          <>
            <Image
              source={cardImageMapping[thumbnail]}
              style={styles.image}
              resizeMode="stretch"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => {
                setImageLoading(false);
              }}
            />
            {imageLoading && (
              <ActivityIndicator
                style={{ position: "absolute" }}
                size="small"
                color={theme.colors.purple}
              />
            )}
          </>
        ) : null}
      </View>
    </View>
  );
}
