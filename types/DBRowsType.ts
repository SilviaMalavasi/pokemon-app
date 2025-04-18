export interface CardRow {
  id: string;
  name: string;
  supertype: string;
  subtypes: string;
  types: string;
  rules: string | null;
  hp: number;
  evolvesFrom: string | null;
  evolvesTo: string | null;
  weaknesses: string | null;
  resistances: string | null;
  retreatCost: string | null;
  convertedRetreatCost: number | null;
  flavorText: string | null;
  artist: string | null;
  rarity: string | null;
  nationalPokedexNumbers: string | null;
  regulationMark: string | null;
  imagesSmall: string;
  imagesLarge: string;
  number: string;
  cardSetId: string;
}

export interface AttackRow {
  name: string;
  damage: string;
  text: string;
  cost: string | null;
  convertedEnergyCost: number;
}

export interface AbilityRow {
  name: string;
  text: string;
}
