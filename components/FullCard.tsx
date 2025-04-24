import React, { useState } from "react";
import { View, Image, ActivityIndicator, ScrollView } from "react-native";
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
  card: CardType;
}

export default function FullCard({ card }: FullCardProps) {
  const [loading, setLoading] = useState(true);
  const imageSource = getCardImage(card.imagesLarge || card.imagesSmall);

  return (
    <ScrollView>
      <ThemedView style={FullCardStyle.container}>
        {imageSource ? (
          <View style={{ position: "relative", justifyContent: "center", alignItems: "center" }}>
            <Image
              source={imageSource}
              style={FullCardStyle.image}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
            {loading && (
              <ActivityIndicator
                style={{ position: "absolute" }}
                size="large"
                color="#888"
              />
            )}
          </View>
        ) : null}
        <ThemedText type="title">{card.name}</ThemedText>
        <ThemedText>Supertype: {card.supertype}</ThemedText>
        <ThemedText>Subtypes: {card.subtypes?.join(", ")}</ThemedText>
        <ThemedText>Types: {card.types?.join(", ")}</ThemedText>
        <ThemedText>HP: {card.hp}</ThemedText>
        {card.evolvesFrom && <ThemedText>Evolves from: {card.evolvesFrom}</ThemedText>}
        {card.evolvesTo && <ThemedText>Evolves to: {card.evolvesTo.join(", ")}</ThemedText>}
        {card.rules && card.rules.length > 0 && (
          <View>
            <ThemedText>Rules:</ThemedText>
            {card.rules.map((rule, idx) => (
              <ThemedText key={idx}>- {rule}</ThemedText>
            ))}
          </View>
        )}
        {card.abilities && card.abilities.length > 0 && (
          <View>
            <ThemedText>Abilities:</ThemedText>
            {card.abilities.map((ab) => (
              <View
                key={ab.id}
                style={{ marginBottom: 4 }}
              >
                <ThemedText>- {ab.name}</ThemedText>
                <ThemedText>{ab.text}</ThemedText>
              </View>
            ))}
          </View>
        )}
        {card.attacks && card.attacks.length > 0 && (
          <View>
            <ThemedText>Attacks:</ThemedText>
            {card.attacks.map((atk) => (
              <View
                key={atk.id}
                style={{ marginBottom: 4 }}
              >
                <ThemedText>
                  - {atk.name} ({atk.damage})
                </ThemedText>
                <ThemedText>{atk.text}</ThemedText>
                {atk.cost && <ThemedText>Cost: {atk.cost.join(", ")}</ThemedText>}
                {atk.convertedEnergyCost !== undefined && (
                  <ThemedText>Converted Energy Cost: {atk.convertedEnergyCost}</ThemedText>
                )}
              </View>
            ))}
          </View>
        )}
        {card.weaknesses && card.weaknesses.length > 0 && (
          <View>
            <ThemedText>Weaknesses:</ThemedText>
            {card.weaknesses.map((w, idx) => (
              <ThemedText key={idx}>
                {w.type}: {w.value}
              </ThemedText>
            ))}
          </View>
        )}
        {card.resistances && card.resistances.length > 0 && (
          <View>
            <ThemedText>Resistances:</ThemedText>
            {card.resistances.map((r, idx) => (
              <ThemedText key={idx}>
                {r.type}: {r.value}
              </ThemedText>
            ))}
          </View>
        )}
        {card.retreatCost && card.retreatCost.length > 0 && (
          <ThemedText>Retreat Cost: {card.retreatCost.join(", ")}</ThemedText>
        )}
        {card.convertedRetreatCost !== null && (
          <ThemedText>Converted Retreat Cost: {card.convertedRetreatCost}</ThemedText>
        )}
        {card.flavorText && <ThemedText>Flavor: {card.flavorText}</ThemedText>}
        {card.artist && <ThemedText>Artist: {card.artist}</ThemedText>}
        {card.rarity && <ThemedText>Rarity: {card.rarity}</ThemedText>}
        {card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0 && (
          <ThemedText>National Pokedex Numbers: {card.nationalPokedexNumbers.join(", ")}</ThemedText>
        )}
        {card.regulationMark && <ThemedText>Regulation Mark: {card.regulationMark}</ThemedText>}
        <ThemedText>Number: {card.number}</ThemedText>
        {card.cardSet && (
          <View>
            <ThemedText>
              Set: {card.cardSet.name} ({card.cardSet.series})
            </ThemedText>
            <ThemedText>Set Code: {card.cardSet.setId}</ThemedText>
            <ThemedText>Printed Total: {card.cardSet.printedTotal}</ThemedText>
            <ThemedText>Total: {card.cardSet.total}</ThemedText>
            <ThemedText>Release Date: {card.cardSet.releaseDate}</ThemedText>
            <ThemedText>PTCGO Code: {card.cardSet.ptcgoCode}</ThemedText>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}
