import React, { useState } from "react";
import { View, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { Svg, Path } from "react-native-svg";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { Link } from "expo-router";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";
import cardImages from "@/helpers/cardImageMapping";
import styles from "@/style/CompactDeckStyle";

function getDeckImage(imagePath: string) {
  if (!imagePath) return undefined;
  const filename = imagePath.split("/").pop() || "";
  return cardImages[filename];
}

interface CompactDeckProps {
  deck: {
    id: number;
    name: string;
    thumbnail: string | null;
  };
  onImageLoad?: () => void;
  loading?: boolean;
  onDelete?: (id: number) => void;
}

export default function CompactDeck({ deck, onImageLoad, loading, onDelete }: CompactDeckProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const imageSource = getDeckImage(deck.thumbnail || "");

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center", minHeight: vw(68) }]}>
        <ActivityIndicator
          size="large"
          color={theme.colors.textAlternative}
        />
      </ThemedView>
    );
  }

  return (
    <Link href={{ pathname: "/decks/[deckId]", params: { deckId: deck.id } }}>
      <ThemedView style={styles.container}>
        <View style={styles.imageContainer}>
          {imageSource ? (
            <View style={{ position: "relative", justifyContent: "center", alignItems: "center" }}>
              <Image
                source={imageSource}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => {
                  setImageLoading(false);
                  if (onImageLoad) onImageLoad();
                }}
              />
              {/* Delete button absolute on thumbnail */}
              {typeof onDelete === "function" && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(deck.id);
                  }}
                  style={styles.deleteButton}
                  accessibilityLabel="Delete deck"
                >
                  <Svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 330.64 367.15"
                  >
                    <Path
                      d="M291.19,61.94h-40.46v-22.47c-.1-17.34-14.13-31.37-31.47-31.47H111.38c-17.34,.1-31.37,14.13-31.47,31.47v22.47H39.45c-17.33,.1-31.37,14.13-31.45,31.47v17.97c.08,17.35,14.13,31.37,31.45,31.47h251.73c17.33-.1,31.37-14.13,31.45-31.47v-17.97c-.08-17.34-14.13-31.37-31.45-31.47Zm-184.31,0v-22.47c0-2.49,2.02-4.5,4.5-4.5h107.88c1.2,0,2.34,.47,3.19,1.31s1.31,1.99,1.31,3.19v22.47s-116.88,0-116.88,0Z"
                      stroke="#fff"
                      strokeMiterlimit={10}
                      strokeWidth={16}
                    />
                    <Path
                      d="M39.45,169.82h-7.01l27.16,163.08c2.48,15.22,15.68,26.36,31.1,26.25H239.94c15.42,.12,28.62-11.02,31.1-26.25l27.16-163.08H39.45Zm177.68,146.47c-6.73,6.73-18.5,5.85-26.3-1.95l-25.51-25.51-25.51,25.51c-7.81,7.81-19.59,8.67-26.3,1.95s-5.85-18.5,1.95-26.3l25.51-25.51-25.51-25.51c-7.79-7.79-8.68-19.58-1.95-26.3,6.71-6.71,18.52-5.83,26.3,1.95l25.51,25.51,25.51-25.51c7.79-7.79,19.58-8.68,26.3-1.95s5.83,18.52-1.95,26.3l-25.51,25.51,25.51,25.51c7.81,7.81,8.67,19.59,1.95,26.3Z"
                      stroke="#fff"
                      strokeMiterlimit={10}
                      strokeWidth={16}
                    />
                  </Svg>
                </TouchableOpacity>
              )}
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
        <View style={styles.textContainer}>
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
