/**
 * API Endpoint: /api/stupidSearch
 * Method: GET
 * Description: Performs a "stupid search" across multiple fields in the database to find cards matching the search term.
 * Query Parameters:
 *   - query (string): The search term to look for in the database.
 * Response:
 *   - 200 OK: Returns an array of cards matching the search term.
 *   - 400 Bad Request: If the query parameter is missing.
 *   - 500 Internal Server Error: If an error occurs during the search.
 */

import { NextApiRequest, NextApiResponse } from "next";
import Database from "better-sqlite3";
import path from "path";
import { PokemonCard, Attack, Ability, CardSet } from "../../types/PokemonCardType";
import { CardRow, AttackRow, AbilityRow } from "../../types/DbRows";

const dbPath = path.resolve(process.cwd(), "db/pokemonCardsDB.sqlite");
const db = new Database(dbPath);

// Types for DB rows

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required and must be a string" });
  }

  try {
    const searchQuery = `%${query}%`;

    const cards = db
      .prepare(
        `
      SELECT DISTINCT Card.*
      FROM Card
      LEFT JOIN CardAbilities ON Card.id = CardAbilities.cardId
      LEFT JOIN Abilities ON CardAbilities.abilityId = Abilities.id
      LEFT JOIN CardAttacks ON Card.id = CardAttacks.cardId
      LEFT JOIN Attacks ON CardAttacks.attackId = Attacks.id
      LEFT JOIN CardSet ON Card.cardSetId = CardSet.id
      WHERE
        Card.name LIKE ? OR
        Card.supertype LIKE ? OR
        Card.subtypes LIKE ? OR
        Card.types LIKE ? OR
        Card.evolvesFrom LIKE ? OR
        Card.weaknesses LIKE ? OR
        Card.resistances LIKE ? OR
        Card.evolvesTo LIKE ? OR
        Card.retreatCost LIKE ? OR
        Card.rarity LIKE ? OR
        Card.regulationMark LIKE ? OR
        Card.rules LIKE ? OR
        CardSet.name LIKE ? OR
        CardSet.series LIKE ? OR
        Abilities.name LIKE ? OR
        Abilities.text LIKE ? OR
        Attacks.name LIKE ? OR
        Attacks.damage LIKE ? OR
        Attacks.text LIKE ? OR
        CardAttacks.cost LIKE ?
    `
      )
      .all(
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery
      );

    // For each card, fetch attacks, abilities, and cardSet
    const getAttacks = db.prepare(`
      SELECT Attacks.name, Attacks.damage, Attacks.text, CardAttacks.cost, CardAttacks.convertedEnergyCost
      FROM CardAttacks
      JOIN Attacks ON CardAttacks.attackId = Attacks.id
      WHERE CardAttacks.cardId = ?
    `);
    const getAbilities = db.prepare(`
      SELECT Abilities.name, Abilities.text
      FROM CardAbilities
      JOIN Abilities ON CardAbilities.abilityId = Abilities.id
      WHERE CardAbilities.cardId = ?
    `);
    const getCardSet = db.prepare(`
      SELECT id, name, series, printedTotal, total, releaseDate, updatedAt, symbol, logo, ptcgoCode
      FROM CardSet WHERE id = ?
    `);

    const cardsWithDetails: PokemonCard[] = (cards as CardRow[]).map((c) => {
      const attacks: Attack[] = (getAttacks.all(c.id) as AttackRow[]).map((a) => ({
        name: a.name,
        damage: a.damage,
        text: a.text,
        cost: a.cost ? JSON.parse(a.cost) : [],
        convertedEnergyCost: a.convertedEnergyCost,
        id: 0, // id is not fetched here, set to 0 or fetch if needed
      }));
      const abilities: Ability[] = (getAbilities.all(c.id) as AbilityRow[]).map((ab) => ({
        name: ab.name,
        text: ab.text,
        id: 0, // id is not fetched here, set to 0 or fetch if needed
      }));
      const cardSet: CardSet | undefined = c.cardSetId
        ? (getCardSet.get(c.cardSetId) as CardSet | undefined)
        : undefined;
      return {
        ...c,
        subtypes: c.subtypes ? JSON.parse(c.subtypes) : [],
        types: c.types ? JSON.parse(c.types) : [],
        evolvesTo: c.evolvesTo ? JSON.parse(c.evolvesTo) : [],
        weaknesses: c.weaknesses ? JSON.parse(c.weaknesses) : [],
        resistances: c.resistances ? JSON.parse(c.resistances) : [],
        retreatCost: c.retreatCost ? JSON.parse(c.retreatCost) : [],
        nationalPokedexNumbers: c.nationalPokedexNumbers ? JSON.parse(c.nationalPokedexNumbers) : [],
        rules: c.rules ? JSON.parse(c.rules) : [],
        images: {
          small: c.imagesSmall,
          large: c.imagesLarge,
        },
        attacks,
        abilities,
        cardSet,
      } as PokemonCard;
    });

    res.status(200).json(cardsWithDetails);
  } catch (error) {
    console.error("Error performing search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
