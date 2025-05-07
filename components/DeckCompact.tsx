import React, { useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import DeckCompactStyle from "@/style/DeckCompactStyle";
import { Link } from "expo-router";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";

interface DeckCompactProps {
  deck: {
    id: number;
    name: string;
    thumbnail: string | null;
  };
  onImageLoad?: () => void;
  loading?: boolean;
}

export default function DeckCompact({ deck, onImageLoad, loading }: DeckCompactProps) {
  const [imageLoading, setImageLoading] = useState(true);

  if (loading) {
    return (
      <ThemedView
        style={[DeckCompactStyle.container, { justifyContent: "center", alignItems: "center", minHeight: vw(68) }]}
      >
        <ActivityIndicator
          size="large"
          color={theme.colors.textAlternative}
        />
      </ThemedView>
    );
  }

  return (
    <Link href={{ pathname: "/decks/[deckId]", params: { deckId: deck.id } }}>
      <ThemedView style={DeckCompactStyle.container}>
        <View style={DeckCompactStyle.imageContainer}>
          {deck.thumbnail ? (
            <View style={{ position: "relative", justifyContent: "center", alignItems: "center" }}>
              <Image
                source={{ uri: deck.thumbnail }}
                style={DeckCompactStyle.image}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => {
                  setImageLoading(false);
                  if (onImageLoad) onImageLoad();
                }}
              />
              {imageLoading && (
                <ActivityIndicator
                  style={{ position: "absolute" }}
                  size="small"
                  color={theme.colors.textAlternative}
                />
              )}
            </View>
          ) : null}
        </View>
        <View style={DeckCompactStyle.textContainer}>
          <ThemedText
            type="default"
            style={{ textAlign: "center" }}
          >
            {deck.name}
          </ThemedText>
        </View>
      </ThemedView>
    </Link>
  );
}
