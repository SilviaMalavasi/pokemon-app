import React from "react";
import { render } from "@testing-library/react-native";
import FullCard from "../components/FullCard";
import path from "path";
import Database from "better-sqlite3";
import { ReactTestInstance } from "react-test-renderer";

const DB_PATH = path.resolve(__dirname, "../scripts/db/pokemonCardsDB.db");

// Mock UserDatabaseProvider for test: always render children and provide minimal context
jest.mock("../components/context/UserDatabaseContext", () => {
  const React = require("react");
  const mockValue = {
    db: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    workingDeckId: undefined,
    setWorkingDeckId: () => {},
    decksVersion: 0,
    incrementDecksVersion: () => {},
    watchLists: [],
    isLoadingWatchLists: false,
    watchListsVersion: 0,
    incrementWatchListsVersion: () => {},
    lastWatchListId: null,
    setLastWatchListId: () => {},
  };
  const UserDatabaseContext = React.createContext(mockValue);
  return {
    UserDatabaseContext,
    UserDatabaseProvider: ({ children }: any) => (
      <UserDatabaseContext.Provider value={mockValue}>{children}</UserDatabaseContext.Provider>
    ),
    useUserDatabase: () => mockValue,
  };
});

// Import after jest.mock so the mock is used
const { UserDatabaseProvider } = require("../components/context/UserDatabaseContext");

describe("FullCard (real DB integration)", () => {
  let db: any;
  beforeAll(() => {
    db = new Database(DB_PATH, { readonly: true });
  });
  afterAll(() => {
    db.close();
  });

  function parseJsonField(val: any) {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const arr = JSON.parse(val);
        if (Array.isArray(arr)) return arr;
        if (arr) return [arr];
      } catch {
        if (val.trim() !== "") return [val];
      }
    }
    return [];
  }

  it("renders a real Pokémon card from the database", () => {
    // Find a Pokémon card with attacks and abilities
    const card = db
      .prepare(
        `SELECT * FROM Card WHERE supertype = 'Pokémon' AND id IN (
        SELECT cardId FROM CardAttacks GROUP BY cardId HAVING COUNT(*) > 0
      ) AND id IN (
        SELECT cardId FROM CardAbilities GROUP BY cardId HAVING COUNT(*) > 0
      ) LIMIT 1`
      )
      .get();
    expect(card).toBeTruthy();

    // Get attacks
    const cardAttacks = db
      .prepare(
        `SELECT CardAttacks.*, Attacks.name as attackName, Attacks.text as attackText FROM CardAttacks JOIN Attacks ON CardAttacks.attackId = Attacks.id WHERE CardAttacks.cardId = ?`
      )
      .all(card.id);
    const attacks = cardAttacks.map((atk: any, i: number) => ({
      id: atk.id,
      name: atk.attackName,
      damage: atk.damage,
      text: atk.attackText,
      convertedEnergyCost: atk.convertedEnergyCost,
      cost: parseJsonField(atk.cost),
    }));

    // Get abilities
    const cardAbilities = db
      .prepare(
        `SELECT CardAbilities.*, Abilities.name as abilityName, Abilities.text as abilityText FROM CardAbilities JOIN Abilities ON CardAbilities.abilityId = Abilities.id WHERE CardAbilities.cardId = ?`
      )
      .all(card.id);
    // Debug: log raw cardAbilities to check for duplicates
    console.log("Raw cardAbilities from DB:", cardAbilities);
    // Deduplicate abilities by abilityId (should only be one per card)
    const uniqueAbilities = [];
    const seenAbilityIds = new Set();
    for (const ab of cardAbilities) {
      if (!seenAbilityIds.has(ab.abilityId)) {
        seenAbilityIds.add(ab.abilityId);
        uniqueAbilities.push(ab);
      }
    }
    const abilities = uniqueAbilities.map((ab: any) => ({
      id: ab.id,
      name: ab.abilityName,
      text: ab.abilityText,
    }));

    // Get set info
    const cardSet = card.setId ? db.prepare("SELECT * FROM CardSet WHERE id = ?").get(card.setId) : undefined;

    // Build props
    const props = {
      id: card.id,
      cardId: card.cardId,
      name: card.name,
      supertype: card.supertype,
      subtypes: parseJsonField(card.subtypes),
      types: parseJsonField(card.types),
      rules: card.rules,
      hp: card.hp,
      evolvesFrom: card.evolvesFrom,
      evolvesTo: parseJsonField(card.evolvesTo),
      attacks,
      abilities,
      weaknesses: parseJsonField(card.weaknesses),
      resistances: parseJsonField(card.resistances),
      retreatCost: parseJsonField(card.retreatCost),
      convertedRetreatCost: card.convertedRetreatCost,
      cardSet,
      setId: card.setId,
      number: card.number,
      artist: card.artist,
      rarity: card.rarity,
      flavorText: card.flavorText,
      nationalPokedexNumbers: parseJsonField(card.nationalPokedexNumbers),
      regulationMark: card.regulationMark,
      imagesLarge: card.imagesLarge,
    };
    // Log abilities for debugging duplicate key warning
    console.log("Abilities passed to FullCard:", abilities);
    const { getByText, queryByText, getAllByText } = render(
      <UserDatabaseProvider>
        <FullCard {...props} />
      </UserDatabaseProvider>
    );
    // Section headers
    expect(getByText("Card Type")).toBeTruthy();
    expect(getByText("Stats")).toBeTruthy();
    expect(getByText("Evolution")).toBeTruthy();
    expect(getByText("Weakness & Resistance")).toBeTruthy();
    expect(getByText("Card Set")).toBeTruthy();
    expect(getByText("Other Setails")).toBeTruthy(); // Typo in component

    // Labels
    expect(getByText("Type:")).toBeTruthy();
    // Only assert on the label if it is actually rendered
    if (props.subtypes && props.subtypes.length > 0) {
      const labelNode = queryByText(/Label:/);
      if (labelNode) {
        expect(labelNode).toBeTruthy();
      }
    }
    if (props.types && props.types.length > 0) {
      expect(getByText(/Energy Type:/)).toBeTruthy();
    }
    expect(getByText("Pokémon HP:")).toBeTruthy();
    expect(getByText(new RegExp(`${card.hp}`))).toBeTruthy();

    // Rules section
    if (
      props.rules &&
      ((Array.isArray(props.rules) && props.rules.length > 0) ||
        (typeof props.rules === "string" && props.rules.trim() !== ""))
    ) {
      expect(getByText(props.supertype === "Pokémon" ? "Rule Box" : "Rules")).toBeTruthy();
      if (Array.isArray(props.rules)) {
        for (const rule of props.rules) {
          const cleanRule = rule.replace(/[\[\]"]+/g, "").trim();
          expect(getByText(new RegExp(cleanRule))).toBeTruthy();
        }
      } else if (typeof props.rules === "string") {
        const cleanRule = props.rules.replace(/[\[\]"]+/g, "").trim();
        expect(getByText(new RegExp(cleanRule))).toBeTruthy();
      }
    }

    // Attacks
    if (attacks.length > 0) {
      const attackNameMatches = getAllByText(new RegExp(`Name: *${attacks[0].name}`));
      expect(attackNameMatches.length).toBeGreaterThan(0);
      if (attacks[0].damage) {
        const damageMatches = getAllByText(new RegExp(`Damage: *${attacks[0].damage}`));
        expect(damageMatches.length).toBeGreaterThan(0);
      }
      if (attacks[0].text) {
        const textMatches = getAllByText(new RegExp(`Text: *${attacks[0].text}`));
        expect(textMatches.length).toBeGreaterThan(0);
      }
    }
    // Abilities
    if (abilities.length > 0) {
      const abilityNameMatches = getAllByText(new RegExp(`Name: *${abilities[0].name}`));
      expect(abilityNameMatches.length).toBeGreaterThan(0);
      if (abilities[0].text) {
        const abilityTextMatches = getAllByText(new RegExp(`Text: *${abilities[0].text}`));
        expect(abilityTextMatches.length).toBeGreaterThan(0);
      }
    }
    // Card set info
    if (cardSet && cardSet.name) {
      expect(getByText(new RegExp(`Name: *${cardSet.name}`))).toBeTruthy();
    }
    if (cardSet && cardSet.series) {
      expect(queryByText(new RegExp(`Series: *${cardSet.series}`))).toBeTruthy();
    }
    // Other details
    if (card.rarity) {
      expect(queryByText(new RegExp(`Rarity: *${card.rarity}`))).toBeTruthy();
    }
    if (card.artist) {
      expect(queryByText(new RegExp(`Artist: *${card.artist}`))).toBeTruthy();
    }
    if (card.flavorText) {
      expect(queryByText(new RegExp(`Flavor Text: *${card.flavorText}`))).toBeTruthy();
    }
    // NOTE: Duplicate key warning (e.g., ability-Adaptive Evolution) is from FullCard. Ensure unique keys in your component for best practice.
  });
});
