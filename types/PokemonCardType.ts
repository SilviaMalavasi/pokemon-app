export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp: string;
  types: string[];
  evolvesFrom?: string;
  flavorText?: string;
  rarity?: string;
  image?: string;
  attacks?: Attack[];
  abilities?: Ability[];
  weaknesses?: Weakness[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  cardSet?: CardSet;
  number: string;
  artist?: string;
  nationalPokedexNumbers?: number[];
  regulationMark?: string;
  images?: CardImages;
}

export interface Ability {
  name: string;
  text: string;
  type: string;
}

export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface CardImages {
  small: string;
  large: string;
}

export interface CardSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ptcgoCode: string;
  releaseDate: string;
  updatedAt: string;
  images: SetImages;
}

export interface SetImages {
  symbol: string;
  logo: string;
}
