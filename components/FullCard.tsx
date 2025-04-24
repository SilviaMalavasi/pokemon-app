import React from "react";
import { View, Image } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { CardType } from "@/types/PokemonCardType";
import FullCardStyle from "@/style/FullCardStyle";
import cardImages from "@/db/cardImages";

function getCardImage(imagePath: string) {
  if (!imagePath) return undefined;
  const filename = imagePath.split("/").pop() || "";
  return cardImages[filename];
}

interface FullCardProps {
  card: Pick<CardType, "cardId" | "name" | "imagesSmall">;
}

export default function FullCard({ card }: FullCardProps) {
  return (
    <ThemedView style={FullCardStyle.container}>
      {getCardImage(card.imagesSmall) ? (
        <Image
          source={getCardImage(card.imagesSmall)}
          style={FullCardStyle.image}
          resizeMode="contain"
        />
      ) : null}
      <ThemedView> </ThemedView>
    </ThemedView>
  );
}
