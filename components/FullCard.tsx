import React, { useState } from "react";
import { View, Image, ScrollView } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { Ability, Attack, CardSet } from "@/types/PokemonCardType";
import { LinearGradient } from "expo-linear-gradient";
import cardImages from "@/helpers/cardImageMapping";
import styles from "@/style/FullCardStyle";
import { theme } from "@/style/ui/Theme";
import AddToDeckModal from "@/components/deckbuilder/AddToDeckModal";

function getCardImage(imagePath: string) {
  if (!imagePath) return undefined;
  const filename = imagePath.split("/").pop() || "";
  return cardImages[filename];
}

// Utility to handle json-string-array fields
function parseJsonStringArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) return arr;
      if (arr) return [arr];
    } catch {
      if (value.trim() !== "") return [value];
    }
  }
  return [];
}

interface FullCardProps {
  id: number;
  cardId: string;
  name: string;
  supertype: string;
  subtypes: string[];
  types: string[];
  rules: string[] | string | null;
  hp: number;
  evolvesFrom: string | null;
  evolvesTo: string[] | null;
  attacks?: Attack[];
  abilities?: Ability[];
  weaknesses: { type: string; value: string }[] | null;
  resistances: { type: string; value: string }[] | null;
  retreatCost: string[] | null;
  convertedRetreatCost: number | null;
  cardSet?: CardSet;
  setId: number;
  number: string;
  artist: string | null;
  rarity: string | null;
  flavorText: string | null;
  nationalPokedexNumbers: number[] | null;
  regulationMark: string | null;
  imagesLarge: string;
}

export default function FullCard(props: FullCardProps) {
  const [loading, setLoading] = useState(true);
  const imageSource = getCardImage(props.imagesLarge);

  // Stage and Subtypes extraction
  let stage = "-";
  let subtypes = parseJsonStringArray(props.subtypes);
  const stageTypes = ["Basic", "Stage 1", "Stage 2"];
  const foundStage = subtypes.find((s) => stageTypes.includes(s));
  if (foundStage) stage = foundStage;
  const filteredSubtypes = subtypes.filter((s) => !stageTypes.includes(s));

  const renderCardTypes = () => {
    const types = parseJsonStringArray(props.types).filter((t) => t && t !== "…" && t !== "...");
    if (types.length === 0) return null;
    return (
      <ThemedText style={{ paddingBottom: 4 }}>
        <ThemedText
          type="defaultSemiBold"
          color={theme.colors.textAlternative}
        >
          Energy Type:{" "}
        </ThemedText>
        {types.join(", ")}
      </ThemedText>
    );
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        {imageSource ? (
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
            {/* Add to Deck Button */}
            <View style={{ alignItems: "flex-end", marginBottom: theme.padding.small }}>
              <AddToDeckModal
                cardId={props.cardId}
                cardName={props.name}
              />
            </View>
          </View>
        ) : null}

        {/* Card Types */}
        <ThemedView style={styles.cardDetailsContainer}>
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0)", theme.colors.background, theme.colors.background]}
            locations={[0, 0.4, 0.4, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.cardDetailsLabel}
          >
            <ThemedText type="label">Card Type</ThemedText>
          </LinearGradient>
          <ThemedText style={{ paddingBottom: 4 }}>
            <ThemedText
              type="defaultSemiBold"
              color={theme.colors.textAlternative}
            >
              Type:{" "}
            </ThemedText>
            {props.supertype}
          </ThemedText>
          {filteredSubtypes.length > 0 && (
            <ThemedText style={{ paddingBottom: 4 }}>
              <ThemedText
                type="defaultSemiBold"
                color={theme.colors.textAlternative}
              >
                Label:{" "}
              </ThemedText>
              {filteredSubtypes.join(", ")}
            </ThemedText>
          )}

          {renderCardTypes()}
        </ThemedView>

        {/* Rules */}
        {props.rules &&
          ((Array.isArray(props.rules) && props.rules.length > 0) ||
            (props.rules && typeof props.rules === "string" && (props.rules as string).trim() !== "")) && (
            <ThemedView style={styles.cardDetailsContainer}>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,255,255,0)",
                  theme.colors.background,
                  theme.colors.background,
                ]}
                locations={[0, 0.4, 0.4, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardDetailsLabel}
              >
                <ThemedText type="label">{props.supertype === "Pokémon" ? "Rule Box" : "Rules"}</ThemedText>
              </LinearGradient>

              {/* Display each rule in its own block if there are multiple rules */}
              {Array.isArray(props.rules) && props.rules.length > 0 ? (
                props.rules.map((rule, index) => (
                  <ThemedText
                    key={`rule-${index}`}
                    style={{ paddingBottom: 4 }}
                  >
                    {rule.replace(/[\[\]"]+/g, "").trim()}
                  </ThemedText>
                ))
              ) : (
                <ThemedText style={{ paddingBottom: 4 }}>
                  {typeof props.rules === "string" ? props.rules.replace(/[\[\]"]+/g, "").trim() : "-"}
                </ThemedText>
              )}
            </ThemedView>
          )}

        {/* Attacks */}
        {props.attacks && props.attacks.length > 0 && (
          <ThemedView style={styles.cardDetailsContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0)", theme.colors.background, theme.colors.background]}
              locations={[0, 0.4, 0.4, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.cardDetailsLabel}
            >
              <ThemedText type="label">Attacks</ThemedText>
            </LinearGradient>
            {props.attacks.map((atk, index) => (
              <View
                key={`attack-${atk.name}-${atk.id}`}
                style={{
                  marginBottom: index === (props.attacks ?? []).length - 1 ? 0 : theme.padding.medium,
                }}
              >
                <ThemedText
                  style={{ paddingBottom: 4 }}
                  color={theme.colors.textHilight}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    color={theme.colors.textHilight}
                  >
                    Name:{" "}
                  </ThemedText>
                  {atk.name}
                </ThemedText>

                {atk.damage && (
                  <ThemedText style={{ paddingBottom: 4 }}>
                    <ThemedText
                      type="defaultSemiBold"
                      color={theme.colors.textAlternative}
                    >
                      Damage:{" "}
                    </ThemedText>
                    {atk.damage}
                  </ThemedText>
                )}

                {atk.text && (
                  <ThemedText style={{ paddingBottom: 4 }}>
                    <ThemedText
                      type="defaultSemiBold"
                      color={theme.colors.textAlternative}
                    >
                      Text:{" "}
                    </ThemedText>
                    {atk.text}
                  </ThemedText>
                )}

                {atk.convertedEnergyCost !== undefined && (
                  <ThemedText style={{ paddingBottom: 4 }}>
                    <ThemedText
                      type="defaultSemiBold"
                      color={theme.colors.textAlternative}
                    >
                      Cost:{" "}
                    </ThemedText>
                    {atk.convertedEnergyCost}
                  </ThemedText>
                )}

                {(() => {
                  const costArr = parseJsonStringArray(atk.cost);
                  if (costArr.length > 0) {
                    return (
                      <ThemedText style={{ paddingBottom: 4 }}>
                        <ThemedText
                          type="defaultSemiBold"
                          color={theme.colors.textAlternative}
                        >
                          Energy Cost:{" "}
                        </ThemedText>
                        {costArr.join(", ")}
                      </ThemedText>
                    );
                  }
                  return null;
                })()}
              </View>
            ))}
          </ThemedView>
        )}

        {/* Abilities */}
        {props.abilities && props.abilities.length > 0 && (
          <ThemedView style={styles.cardDetailsContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0)", theme.colors.background, theme.colors.background]}
              locations={[0, 0.4, 0.4, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.cardDetailsLabel}
            >
              <ThemedText type="label">Abilities</ThemedText>
            </LinearGradient>
            {props.abilities.map((ability, index) => (
              <View
                key={`ability-${ability.name}`}
                style={{
                  marginBottom: index === (props.abilities ?? []).length - 1 ? 0 : theme.padding.medium,
                }}
              >
                <ThemedText
                  style={{ paddingBottom: 4 }}
                  color={theme.colors.textHilight}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    color={theme.colors.textHilight}
                  >
                    Name:{" "}
                  </ThemedText>
                  {ability.name}
                </ThemedText>
                <ThemedText style={{ paddingBottom: 4 }}>
                  <ThemedText
                    type="defaultSemiBold"
                    color={theme.colors.textAlternative}
                  >
                    Text:{" "}
                  </ThemedText>
                  {ability.text}
                </ThemedText>
              </View>
            ))}
          </ThemedView>
        )}

        {/* Only shown for Pokémon cards */}
        {props.supertype === "Pokémon" && (
          <>
            <ThemedView style={styles.cardDetailsContainer}>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,255,255,0)",
                  theme.colors.background,
                  theme.colors.background,
                ]}
                locations={[0, 0.4, 0.4, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardDetailsLabel}
              >
                <ThemedText type="label">Stats</ThemedText>
              </LinearGradient>

              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  type="defaultSemiBold"
                  color={theme.colors.textAlternative}
                >
                  Pokémon HP:
                </ThemedText>{" "}
                {props.hp || "-"}
              </ThemedText>

              {props.convertedRetreatCost && (
                <ThemedText style={{ paddingBottom: 4 }}>
                  <ThemedText
                    type="defaultSemiBold"
                    color={theme.colors.textAlternative}
                  >
                    Retreat Cost:
                  </ThemedText>{" "}
                  {props.convertedRetreatCost}
                </ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.cardDetailsContainer}>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,255,255,0)",
                  theme.colors.background,
                  theme.colors.background,
                ]}
                locations={[0, 0.4, 0.4, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardDetailsLabel}
              >
                <ThemedText type="label">Evolution</ThemedText>
              </LinearGradient>
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  type="defaultSemiBold"
                  color={theme.colors.textAlternative}
                >
                  Stage:
                </ThemedText>{" "}
                {stage || "-"}
              </ThemedText>
              {(() => {
                let value = props.evolvesFrom;
                if (Array.isArray(value) && value.length > 0) {
                  return (
                    <ThemedText style={{ paddingBottom: 4 }}>
                      <ThemedText
                        type="defaultSemiBold"
                        color={theme.colors.textAlternative}
                      >
                        Evolves From:
                      </ThemedText>{" "}
                      {value.join(", ")}
                    </ThemedText>
                  );
                }
                if (typeof value === "string" && (value as string).trim() !== "") {
                  try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return (
                        <ThemedText style={{ paddingBottom: 4 }}>
                          <ThemedText
                            type="defaultSemiBold"
                            color={theme.colors.textAlternative}
                          >
                            Evolves From:
                          </ThemedText>{" "}
                          {parsed.join(", ")}
                        </ThemedText>
                      );
                    }
                    return (
                      <ThemedText style={{ paddingBottom: 4 }}>
                        <ThemedText
                          type="defaultSemiBold"
                          color={theme.colors.textAlternative}
                        >
                          Evolves From:
                        </ThemedText>{" "}
                        {value}
                      </ThemedText>
                    );
                  } catch {
                    return (
                      <ThemedText style={{ paddingBottom: 4 }}>
                        <ThemedText
                          type="defaultSemiBold"
                          color={theme.colors.textAlternative}
                        >
                          Evolves From:
                        </ThemedText>{" "}
                        {value}
                      </ThemedText>
                    );
                  }
                }
                return null;
              })()}
              {(() => {
                let value = props.evolvesTo;
                if (Array.isArray(value) && value.length > 0) {
                  return (
                    <ThemedText style={{ paddingBottom: 4 }}>
                      <ThemedText
                        type="defaultSemiBold"
                        color={theme.colors.textAlternative}
                      >
                        Evolves To:
                      </ThemedText>{" "}
                      {value.join(", ")}
                    </ThemedText>
                  );
                }
                if (typeof value === "string" && (value as string).trim() !== "") {
                  try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return (
                        <ThemedText style={{ paddingBottom: 4 }}>
                          <ThemedText
                            type="defaultSemiBold"
                            color={theme.colors.textAlternative}
                          >
                            Evolves To:
                          </ThemedText>{" "}
                          {parsed.join(", ")}
                        </ThemedText>
                      );
                    }
                    return (
                      <ThemedText style={{ paddingBottom: 4 }}>
                        <ThemedText
                          type="defaultSemiBold"
                          color={theme.colors.textAlternative}
                        >
                          Evolves To:
                        </ThemedText>{" "}
                        {value}
                      </ThemedText>
                    );
                  } catch {
                    return (
                      <ThemedText style={{ paddingBottom: 4 }}>
                        <ThemedText
                          type="defaultSemiBold"
                          color={theme.colors.textAlternative}
                        >
                          Evolves To:
                        </ThemedText>{" "}
                        {value}
                      </ThemedText>
                    );
                  }
                }
                return null;
              })()}
            </ThemedView>

            <ThemedView style={styles.cardDetailsContainer}>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,255,255,0)",
                  theme.colors.background,
                  theme.colors.background,
                ]}
                locations={[0, 0.4, 0.4, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardDetailsLabel}
              >
                <ThemedText type="label">Weaknesses & Resistances</ThemedText>
              </LinearGradient>
              {(() => {
                let weaknesses = parseJsonStringArray(props.weaknesses);
                if (weaknesses.length > 0) {
                  return (
                    <ThemedText style={{ paddingBottom: 4 }}>
                      <ThemedText
                        type="defaultSemiBold"
                        color={theme.colors.textAlternative}
                      >
                        Weakness:
                      </ThemedText>{" "}
                      {weaknesses.join(", ")}
                    </ThemedText>
                  );
                }
                return null;
              })()}
              {(() => {
                let resistances = parseJsonStringArray(props.resistances);
                if (resistances.length > 0) {
                  return (
                    <ThemedText style={{ paddingBottom: 4 }}>
                      <ThemedText
                        type="defaultSemiBold"
                        color={theme.colors.textAlternative}
                      >
                        Resistance:
                      </ThemedText>{" "}
                      {resistances.join(", ")}
                    </ThemedText>
                  );
                }
                return null;
              })()}
            </ThemedView>
          </>
        )}

        {/* Card Set */}

        <ThemedView style={styles.cardDetailsContainer}>
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0)", theme.colors.background, theme.colors.background]}
            locations={[0, 0.4, 0.4, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.cardDetailsLabel}
          >
            <ThemedText type="label">Card Set</ThemedText>
          </LinearGradient>
          {props.cardId && (
            <ThemedText style={{ paddingBottom: 4 }}>
              <ThemedText
                type="defaultSemiBold"
                color={theme.colors.textAlternative}
              >
                Pokédex Number:
              </ThemedText>{" "}
              {props.cardId.toUpperCase()}
            </ThemedText>
          )}
          {props.regulationMark && (
            <ThemedText style={{ paddingBottom: 4 }}>
              <ThemedText
                type="defaultSemiBold"
                color={theme.colors.textAlternative}
              >
                Regulation Mark:
              </ThemedText>{" "}
              {props.regulationMark}
            </ThemedText>
          )}
          {props.cardSet && props.cardSet.name && (
            <ThemedText style={{ paddingBottom: 4 }}>
              <ThemedText
                type="defaultSemiBold"
                color={theme.colors.textAlternative}
              >
                Name:
              </ThemedText>{" "}
              {props.cardSet.name}
            </ThemedText>
          )}
          {props.cardSet && props.cardSet.series && (
            <ThemedText style={{ paddingBottom: 4 }}>
              <ThemedText
                type="defaultSemiBold"
                color={theme.colors.textAlternative}
              >
                Series:
              </ThemedText>{" "}
              {props.cardSet.series}
            </ThemedText>
          )}
        </ThemedView>
        {/* Other Details */}
        {props.rarity || props.artist || props.flavorText ? (
          <ThemedView style={styles.cardDetailsContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0)", theme.colors.background, theme.colors.background]}
              locations={[0, 0.4, 0.4, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.cardDetailsLabel}
            >
              <ThemedText type="label">Other Details</ThemedText>
            </LinearGradient>
            {props.rarity && (
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  type="defaultSemiBold"
                  color={theme.colors.textAlternative}
                >
                  Rarity:
                </ThemedText>{" "}
                {props.rarity}
              </ThemedText>
            )}
            {props.artist && (
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  type="defaultSemiBold"
                  color={theme.colors.textAlternative}
                >
                  Artist:
                </ThemedText>{" "}
                {props.artist}
              </ThemedText>
            )}
            {props.flavorText && (
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  type="defaultSemiBold"
                  color={theme.colors.textAlternative}
                >
                  Flavor Text:
                </ThemedText>{" "}
                {props.flavorText}
              </ThemedText>
            )}
          </ThemedView>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}
