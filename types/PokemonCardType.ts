export interface Ability {
  id: number;
  name: string;
  text: string;
}

export interface Attack {
  id: number;
  name: string;
  damage: string;
  text: string;
  cost?: string[];
  convertedEnergyCost?: number;
}

export interface CardSet {
  id: number;
  setId: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  updatedAt: string;
  symbol: string;
  logo: string;
  ptcgoCode: string | null;
}

export interface CardType {
  id: number;
  cardId: string;
  name: string;
  supertype: string;
  subtypes: string[];
  types: string[];
  rules: string[] | null;
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
  imagesSmall: string;
  imagesLarge: string;
}
