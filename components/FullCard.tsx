import React, { useState } from "react";
import { View, Image } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import { Ability, Attack, CardSet } from "@/types/PokemonCardType";
import { LinearGradient } from "expo-linear-gradient";
import cardImages from "@/helpers/cardImageMapping";
import styles from "@/style/FullCardStyle";
import { theme } from "@/style/ui/Theme";
import ThemedView from "@/components/base/ThemedView";
import AddToDeckModal from "@/components/deckbuilder/AddToDeckModal";
import AddToWatchListModal from "@/components/deckbuilder/AddToWatchListModal";

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
          fontWeight="bold"
          color={theme.colors.white}
        >
          Energy Type:{" "}
        </ThemedText>
        {types.join(", ")}
      </ThemedText>
    );
  };

  return (
    <>
      <ThemedView
        style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: theme.padding.xlarge * -1 }}
      >
        {imageSource ? (
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </View>
        ) : null}
      </ThemedView>

      <ThemedView
        layout="rounded"
        style={{ position: "relative", zIndex: 2 }}
      >
        <AddToDeckModal
          cardId={props.cardId}
          cardName={props.name}
          supertype={props.supertype}
          subtypes={subtypes}
        />
        <AddToWatchListModal
          cardId={props.cardId}
          cardName={props.name}
        />
      </ThemedView>

      <View>
        <LinearGradient
          colors={[theme.colors.darkGrey, theme.colors.mediumGrey]}
          start={{ x: 0.4, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.summaryContainer}
        >
          {/* Card Types */}
          <View style={styles.cardDetailsContainer}>
            <ThemedText
              type="h3"
              style={styles.title}
            >
              Card Type
            </ThemedText>
            <ThemedText style={{ paddingBottom: 4 }}>
              <ThemedText
                fontWeight="bold"
                color={theme.colors.white}
              >
                Type:{" "}
              </ThemedText>
              {props.supertype}
            </ThemedText>
            {filteredSubtypes.length > 0 && (
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  fontWeight="bold"
                  color={theme.colors.white}
                >
                  Label:{" "}
                </ThemedText>
                {filteredSubtypes.join(", ")}
              </ThemedText>
            )}

            {renderCardTypes()}
          </View>

          {/* Rules */}
          {props.rules &&
            ((Array.isArray(props.rules) && props.rules.length > 0) ||
              (props.rules && typeof props.rules === "string" && (props.rules as string).trim() !== "")) && (
              <View style={styles.cardDetailsContainer}>
                <ThemedText
                  type="h4"
                  style={styles.title}
                >
                  {props.supertype === "Pokémon" ? "Rule Box" : "Rules"}
                </ThemedText>

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
              </View>
            )}

          {/* Attacks */}
          {props.attacks && props.attacks.length > 0 && (
            <View style={styles.cardDetailsContainer}>
              <ThemedText
                type="h3"
                style={styles.title}
              >
                Attacks
              </ThemedText>
              {props.attacks.map((atk, index) => (
                <View
                  key={`attack-${atk.name}-${atk.id}`}
                  style={{
                    marginBottom: index === (props.attacks ?? []).length - 1 ? 0 : theme.padding.medium,
                  }}
                >
                  <ThemedText
                    style={{ paddingBottom: 4 }}
                    color={theme.colors.green}
                  >
                    <ThemedText
                      fontWeight="bold"
                      color={theme.colors.white}
                    >
                      Name:{" "}
                    </ThemedText>
                    {atk.name}
                  </ThemedText>

                  {atk.damage && (
                    <ThemedText style={{ paddingBottom: 4 }}>
                      <ThemedText
                        fontWeight="bold"
                        color={theme.colors.white}
                      >
                        Damage:{" "}
                      </ThemedText>
                      {atk.damage}
                    </ThemedText>
                  )}

                  {atk.text && (
                    <ThemedText style={{ paddingBottom: 4 }}>
                      <ThemedText
                        fontWeight="bold"
                        color={theme.colors.white}
                      >
                        Text:{" "}
                      </ThemedText>
                      {atk.text}
                    </ThemedText>
                  )}

                  {atk.convertedEnergyCost !== undefined && (
                    <ThemedText style={{ paddingBottom: 4 }}>
                      <ThemedText
                        fontWeight="bold"
                        color={theme.colors.white}
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
                            fontWeight="bold"
                            color={theme.colors.white}
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
            </View>
          )}

          {/* Abilities */}
          {props.abilities && props.abilities.length > 0 && (
            <View style={styles.cardDetailsContainer}>
              <ThemedText
                type="h3"
                style={styles.title}
              >
                Abilities
              </ThemedText>
              {props.abilities.map((ability, index) => (
                <View
                  key={`ability-${ability.name}`}
                  style={{
                    marginBottom: index === (props.abilities ?? []).length - 1 ? 0 : theme.padding.medium,
                  }}
                >
                  <ThemedText
                    style={{ paddingBottom: 4 }}
                    color={theme.colors.green}
                  >
                    <ThemedText
                      fontWeight="bold"
                      color={theme.colors.white}
                    >
                      Name:{" "}
                    </ThemedText>
                    {ability.name}
                  </ThemedText>
                  <ThemedText style={{ paddingBottom: 4 }}>
                    <ThemedText
                      fontWeight="bold"
                      color={theme.colors.white}
                    >
                      Text:{" "}
                    </ThemedText>
                    {ability.text}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Only shown for Pokémon cards */}
          {props.supertype === "Pokémon" && (
            <>
              <View style={styles.cardDetailsContainer}>
                <ThemedText
                  type="h3"
                  style={styles.title}
                >
                  Stats
                </ThemedText>

                <ThemedText style={{ paddingBottom: 4 }}>
                  <ThemedText
                    fontWeight="bold"
                    color={theme.colors.white}
                  >
                    Pokémon HP:
                  </ThemedText>{" "}
                  {props.hp || "-"}
                </ThemedText>

                {props.convertedRetreatCost !== undefined && props.convertedRetreatCost !== null && (
                  <ThemedText style={{ paddingBottom: 4 }}>
                    <ThemedText
                      fontWeight="bold"
                      color={theme.colors.white}
                    >
                      Retreat Cost:
                    </ThemedText>{" "}
                    {String(props.convertedRetreatCost)}
                  </ThemedText>
                )}
              </View>

              <View style={styles.cardDetailsContainer}>
                <ThemedText
                  type="h3"
                  style={styles.title}
                >
                  Evolution
                </ThemedText>
                <ThemedText style={{ paddingBottom: 4 }}>
                  <ThemedText
                    fontWeight="bold"
                    color={theme.colors.white}
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
                          fontWeight="bold"
                          color={theme.colors.white}
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
                              fontWeight="bold"
                              color={theme.colors.white}
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
                            fontWeight="bold"
                            color={theme.colors.white}
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
                            fontWeight="bold"
                            color={theme.colors.white}
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
                          fontWeight="bold"
                          color={theme.colors.white}
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
                              fontWeight="bold"
                              color={theme.colors.white}
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
                            fontWeight="bold"
                            color={theme.colors.white}
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
                            fontWeight="bold"
                            color={theme.colors.white}
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
              </View>

              <View style={styles.cardDetailsContainer}>
                <ThemedText
                  type="h3"
                  style={styles.title}
                >
                  Weakness & Resistance
                </ThemedText>
                {(() => {
                  let weaknesses = parseJsonStringArray(props.weaknesses);
                  if (weaknesses.length > 0) {
                    return (
                      <ThemedText style={{ paddingBottom: 4 }}>
                        <ThemedText
                          fontWeight="bold"
                          color={theme.colors.white}
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
                          fontWeight="bold"
                          color={theme.colors.white}
                        >
                          Resistance:
                        </ThemedText>{" "}
                        {resistances.join(", ")}
                      </ThemedText>
                    );
                  }
                  return null;
                })()}
              </View>
            </>
          )}

          {/* Card Set */}

          <View style={styles.cardDetailsContainer}>
            <ThemedText
              type="h3"
              style={styles.title}
            >
              Card Set
            </ThemedText>
            {props.cardId && (
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  fontWeight="bold"
                  color={theme.colors.white}
                >
                  Pokédex Number:
                </ThemedText>{" "}
                {props.cardId.toUpperCase()}
              </ThemedText>
            )}
            {props.regulationMark && (
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  fontWeight="bold"
                  color={theme.colors.white}
                >
                  Regulation Mark:
                </ThemedText>{" "}
                {props.regulationMark}
              </ThemedText>
            )}
            {props.cardSet && props.cardSet.name && (
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  fontWeight="bold"
                  color={theme.colors.white}
                >
                  Name:
                </ThemedText>{" "}
                {props.cardSet.name}
              </ThemedText>
            )}
            {props.cardSet && props.cardSet.series && (
              <ThemedText style={{ paddingBottom: 4 }}>
                <ThemedText
                  fontWeight="bold"
                  color={theme.colors.white}
                >
                  Series:
                </ThemedText>{" "}
                {props.cardSet.series}
              </ThemedText>
            )}
          </View>
          {/* Other Details */}
          {props.rarity || props.artist || props.flavorText ? (
            <View style={styles.cardDetailsContainer}>
              <ThemedText
                type="h3"
                style={styles.title}
              >
                Other Setails
              </ThemedText>
              {props.rarity && (
                <ThemedText style={{ paddingBottom: 4 }}>
                  <ThemedText
                    fontWeight="bold"
                    color={theme.colors.white}
                  >
                    Rarity:
                  </ThemedText>{" "}
                  {props.rarity}
                </ThemedText>
              )}
              {props.artist && (
                <ThemedText style={{ paddingBottom: 4 }}>
                  <ThemedText
                    fontWeight="bold"
                    color={theme.colors.white}
                  >
                    Artist:
                  </ThemedText>{" "}
                  {props.artist}
                </ThemedText>
              )}
              {props.flavorText && (
                <ThemedText style={{ paddingBottom: 4 }}>
                  <ThemedText
                    fontWeight="bold"
                    color={theme.colors.white}
                  >
                    Flavor Text:
                  </ThemedText>{" "}
                  {props.flavorText}
                </ThemedText>
              )}
            </View>
          ) : null}
        </LinearGradient>
      </View>
    </>
  );
}
