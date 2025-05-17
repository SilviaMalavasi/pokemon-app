import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import MainScrollView from "@/components/ui/MainScrollView";
import FullCard from "@/components/FullCard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import { CardType, Ability, Attack } from "@/types/PokemonCardType";
import { theme } from "@/style/ui/Theme";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";

import { View } from "react-native";

export default function FullCardScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const navigation = useNavigation();
  const { db } = useCardDatabase();

  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [cardId])
  );

  useEffect(() => {
    if (!cardId || !db) return;

    const fetchCard = async () => {
      setLoading(true);
      try {
        // 1. Fetch main card data using SQLite
        const cardData = await db.getFirstAsync<CardType>(`SELECT * FROM Card WHERE cardId = ?`, [cardId]);

        if (!cardData) {
          console.error(`Card with cardId ${cardId} not found.`);
          setLoading(false);
          return;
        }

        // 3. Fetch Abilities using SQLite (Join approach)
        const abilitiesData = await db.getAllAsync<Ability>(
          `SELECT DISTINCT a.*
           FROM Abilities a
           JOIN CardAbilities ca ON a.id = ca.abilityId
           WHERE ca.cardId = ?`,
          [cardData.id]
        );
        const abilities: Ability[] = abilitiesData || [];

        // 4. Fetch Attacks using SQLite (Join approach)
        const attacksData = await db.getAllAsync<any>( // Use 'any' or define a more specific type if needed
          `SELECT att.*, ca.cost, ca.convertedEnergyCost, ca.damage
           FROM Attacks att
           JOIN CardAttacks ca ON att.id = ca.attackId
           WHERE ca.cardId = ?`,
          [cardData.id]
        );

        // Process attacks to parse cost JSON and handle potential duplicates (if needed, though JOIN might handle it)
        const processedAttackMap = new Map();
        const attacks: Attack[] = (attacksData || [])
          .map((attack) => ({
            ...attack,
            cost: attack.cost ? JSON.parse(attack.cost) : [],
          }))
          .filter((attack) => {
            if (processedAttackMap.has(attack.id)) {
              return false;
            }
            processedAttackMap.set(attack.id, true);
            return true;
          });

        // 5. Assemble the full card object
        const fullCard = {
          ...cardData,
          abilities,
          attacks,
        };
        setCard(fullCard);
      } catch (error) {
        console.error("Error fetching card data from SQLite:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId, db]);

  useEffect(() => {
    if (card && card.name) {
      navigation.setOptions({ headerTitle: card.name });
    } else {
      navigation.setOptions({ headerTitle: "Card Details" });
    }
  }, [card, navigation]);

  return (
    <>
      <MainScrollView
        headerImage="card-bkg"
        headerTitle={card && card.name ? card.name : "Card Details"}
        scrollRef={scrollRef}
      >
        <View>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.purple}
              style={{ marginTop: 200 }}
            />
          ) : card ? (
            <FullCard
              id={card.id}
              cardId={card.cardId}
              name={card.name}
              supertype={card.supertype}
              subtypes={card.subtypes}
              types={card.types}
              rules={card.rules}
              hp={card.hp}
              evolvesFrom={card.evolvesFrom}
              evolvesTo={card.evolvesTo}
              attacks={card.attacks}
              abilities={card.abilities}
              weaknesses={card.weaknesses}
              resistances={card.resistances}
              retreatCost={card.retreatCost}
              convertedRetreatCost={card.convertedRetreatCost}
              cardSet={card.cardSet}
              setId={card.setId}
              number={card.number}
              artist={card.artist}
              rarity={card.rarity}
              flavorText={card.flavorText}
              nationalPokedexNumbers={card.nationalPokedexNumbers}
              regulationMark={card.regulationMark}
              imagesLarge={card.imagesLarge}
            />
          ) : null}
        </View>
      </MainScrollView>
    </>
  );
}
