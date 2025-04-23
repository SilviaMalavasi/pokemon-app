import React from "react";
import { View, Image } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { CardType } from "@/types/PokemonCardType";
import CompactCardViewStyle from "@/style/ui/CompactCardViewStyle";
import cardImages from "@/db/cardImages";

function getCardImage(imagePath: string) {
  if (!imagePath) return undefined;
  const filename = imagePath.split("/").pop() || "";
  return cardImages[filename];
}

interface CompactCardViewProps {
  card: Pick<CardType, "cardId" | "name" | "imagesSmall">;
}

export default function CompactCardView({ card }: CompactCardViewProps) {
  return (
    <ThemedView style={CompactCardViewStyle.container}>
      {getCardImage(card.imagesSmall) ? (
        <Image
          source={getCardImage(card.imagesSmall)}
          style={CompactCardViewStyle.image}
          resizeMode="contain"
        />
      ) : null}
      <View style={CompactCardViewStyle.textContainer}>
        <ThemedText
          type="default"
          style={{ textAlign: "center" }}
        >
          {card.name}
        </ThemedText>
      </View>
    </ThemedView>
  );
}
