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
          <View style={FullCardStyle.imageContainer}>
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
        <ThemedView type="bordered">
          <ThemedText>Supertype: {card.supertype}</ThemedText>
          {/* Stage and Subtypes separation */}
          {(() => {
            let stage = "-";
            let subtypes = [];
            let raw = card.subtypes;
            if (Array.isArray(raw)) {
              subtypes = raw;
            } else if (typeof raw === "string") {
              try {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) subtypes = arr;
              } catch {
                subtypes = raw ? [raw] : [];
              }
            }
            const stageTypes = ["Basic", "Stage 1", "Stage 2"];
            const foundStage = subtypes.find((s) => stageTypes.includes(s));
            if (foundStage) stage = foundStage;
            const filteredSubtypes = subtypes.filter((s) => !stageTypes.includes(s));
            return (
              <>
                <ThemedText>Stage: {stage}</ThemedText>
                <ThemedText>Subtypes: {filteredSubtypes.length > 0 ? filteredSubtypes.join(", ") : "-"}</ThemedText>
              </>
            );
          })()}
          <ThemedText>Types: {Array.isArray(card.types) ? card.types.join(", ") : card.types || "-"}</ThemedText>
        </ThemedView>
        <ThemedText>HP: {card.hp}</ThemedText>
        {card.evolvesFrom && <ThemedText>Evolves from: {card.evolvesFrom}</ThemedText>}
        {Array.isArray(card.evolvesTo) && card.evolvesTo.length > 0 && (
          <ThemedText>Evolves to: {card.evolvesTo.join(", ")}</ThemedText>
        )}
        {Array.isArray(card.rules) && card.rules.length > 0 && (
          <View>
            <ThemedText>Rules:</ThemedText>
            {card.rules.map((rule, idx) => (
              <ThemedText key={`rule-${idx}`}>- {rule}</ThemedText>
            ))}
          </View>
        )}
        {Array.isArray(card.abilities) && card.abilities.length > 0 && (
          <View>
            <ThemedText>Abilities:</ThemedText>
            {card.abilities.map((ab, idx) => (
              <View
                key={`ability-${ab.id || ab.name || idx}`}
                style={{ marginBottom: 4 }}
              >
                <ThemedText>- {ab.name}</ThemedText>
                <ThemedText>{ab.text}</ThemedText>
              </View>
            ))}
          </View>
        )}
        {Array.isArray(card.attacks) && card.attacks.length > 0 && (
          <View>
            <ThemedText>Attacks:</ThemedText>
            {card.attacks.map((atk, idx) => (
              <View
                key={`attack-${atk.id || atk.name}-${idx}`}
                style={{ marginBottom: 4 }}
              >
                <ThemedText>
                  - {atk.name} ({atk.damage})
                </ThemedText>
                <ThemedText>{atk.text}</ThemedText>
                {Array.isArray(atk.cost) && atk.cost.length > 0 && <ThemedText>Cost: {atk.cost.join(", ")}</ThemedText>}
                {atk.convertedEnergyCost !== undefined && (
                  <ThemedText>Converted Energy Cost: {atk.convertedEnergyCost}</ThemedText>
                )}
              </View>
            ))}
          </View>
        )}
        {Array.isArray(card.weaknesses) && card.weaknesses.length > 0 && (
          <View>
            <ThemedText>Weaknesses:</ThemedText>
            {card.weaknesses.map((w, idx) => (
              <ThemedText key={`weakness-${w.type}-${w.value}-${idx}`}>
                {w.type}: {w.value}
              </ThemedText>
            ))}
          </View>
        )}
        {Array.isArray(card.resistances) && card.resistances.length > 0 && (
          <View>
            <ThemedText>Resistances:</ThemedText>
            {card.resistances.map((r, idx) => (
              <ThemedText key={`resistance-${r.type}-${r.value}-${idx}`}>
                {r.type}: {r.value}
              </ThemedText>
            ))}
          </View>
        )}
        {Array.isArray(card.retreatCost) && card.retreatCost.length > 0 && (
          <ThemedText>Retreat Cost: {card.retreatCost.join(", ")}</ThemedText>
        )}
        {card.convertedRetreatCost !== null && card.convertedRetreatCost !== undefined && (
          <ThemedText>Converted Retreat Cost: {card.convertedRetreatCost}</ThemedText>
        )}
        {card.flavorText && <ThemedText>Flavor: {card.flavorText}</ThemedText>}
        {card.artist && <ThemedText>Artist: {card.artist}</ThemedText>}
        {card.rarity && <ThemedText>Rarity: {card.rarity}</ThemedText>}
        {Array.isArray(card.nationalPokedexNumbers) && card.nationalPokedexNumbers.length > 0 && (
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
