import React from "react";
import { View, Image } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { CardType } from "@/types/PokemonCardType";
import CompactCardViewStyle from "@/style/ui/CompactCardViewStyle";
import cardImages from "@/helpers/cardImages";

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
      <View style={CompactCardViewStyle.imageContainer}>
        {getCardImage(card.imagesSmall) ? (
          <Image
            source={getCardImage(card.imagesSmall)}
            style={CompactCardViewStyle.image}
            resizeMode="contain"
          />
        ) : null}
      </View>
      <View style={CompactCardViewStyle.textContainer}>
        <ThemedText type="default">{card.name}</ThemedText>
      </View>
    </ThemedView>
  );
}
