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
}: CompactDeckLibraryProps) {
  const [imageLoading, setImageLoading] = useState(false);
  const { isLoading, isUpdating, error } = useLimitlessDatabase();
  const { isLoading: isUserDbLoading, isUpdating: isUserDbUpdating, error: userDbError } = useUserDatabase();

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

  return (
    <View style={styles.container}>
      <ThemedText
        type="h3"
        color={theme.colors.white}
        style={styles.title}
      >
        {name || `${variantOf} Decks`}
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
          {tournament && <ThemedText color={theme.colors.white}>{tournament}</ThemedText>}
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
              onPress={() => {
                // TODO: Implement clone logic for userdb
              }}
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
