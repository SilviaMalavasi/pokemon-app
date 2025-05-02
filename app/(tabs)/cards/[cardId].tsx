import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import FullCard from "@/components/FullCard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { CardType, Ability, Attack } from "@/types/PokemonCardType";
import FloatingButton from "@/components/ui/FloatingButton";
import { theme } from "@/style/ui/Theme";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

export default function FullCardScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };

  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        // @ts-ignore
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [cardId])
  );

  useEffect(() => {
    if (!cardId) return;
    const fetchCard = async () => {
      setLoading(true);
      // 1. Fetch main card data
      const { data: cardData, error: cardError } = await supabase
        .from("Card")
        .select("*")
        .eq("cardId", cardId)
        .single();
      if (cardError || !cardData) {
        setLoading(false);
        return;
      }
      // 2. Fetch CardSet
      const { data: setData } = await supabase.from("CardSet").select("*").eq("id", cardData.setId).single();
      // 3. Fetch Abilities
      const { data: cardAbilities } = await supabase
        .from("CardAbilities")
        .select("abilityId")
        .eq("cardId", cardData.id);
      let abilities: Ability[] = [];
      if (cardAbilities && cardAbilities.length > 0) {
        const abilityIds = cardAbilities.map((a: any) => a.abilityId);
        const { data: abilitiesData } = await supabase.from("Abilities").select("*").in("id", abilityIds);
        abilities = abilitiesData || [];
      }
      // 4. Fetch Attacks
      const { data: cardAttacks } = await supabase.from("CardAttacks").select("*").eq("cardId", cardData.id);
      let attacks: Attack[] = [];
      if (cardAttacks && cardAttacks.length > 0) {
        const attackIds = cardAttacks.map((a: any) => a.attackId);
        const { data: attacksData } = await supabase.from("Attacks").select("*").in("id", attackIds);
        attacks = cardAttacks.map((ca: any) => {
          const attack = attacksData?.find((a: any) => a.id === ca.attackId);
          return {
            ...attack,
            cost: ca.cost ? JSON.parse(ca.cost) : [],
            convertedEnergyCost: ca.convertedEnergyCost,
            damage: ca.damage,
          };
        });
      }
      // 5. Assemble the full card object
      setCard({
        ...cardData,
        cardSet: setData,
        abilities,
        attacks,
      });
      setLoading(false);
    };
    fetchCard();
  }, [cardId]);

  return (
    <>
      <FloatingButton
        title="Back to search"
        onPress={handleBack}
      />
      <ParallaxScrollView
        headerImage="advanced-search.webp"
        headerTitle="Card Details"
        scrollRef={scrollRef}
      >
        <ThemedView>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.textAlternative}
              style={{ marginTop: 200 }}
            />
          ) : card ? (
            <FullCard card={card} />
          ) : null}
        </ThemedView>
      </ParallaxScrollView>
    </>
  );
}
