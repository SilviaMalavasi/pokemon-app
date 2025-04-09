export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp: string;
  types: string[];
  rules?: string[];
  abilities?: Ability[];
  attacks?: Attack[];
  weaknesses?: Weakness[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set?: CardSet;
  number: string;
  artist?: string;
  rarity?: string;
  nationalPokedexNumbers?: number[];
  legalities?: Legalities;
  regulationMark?: string;
  images?: CardImages;
  tcgplayer?: TCGPlayer;
  cardmarket?: CardMarket;
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

export interface Legalities {
  unlimited?: string;
  standard?: string;
  expanded?: string;
}

export interface CardSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: Legalities;
  ptcgoCode: string;
  releaseDate: string;
  updatedAt: string;
  images: SetImages;
}

export interface SetImages {
  symbol: string;
  logo: string;
}

export interface CardImages {
  small: string;
  large: string;
}

export interface TCGPlayer {
  url: string;
  updatedAt: string;
  prices: TCGPlayerPrices;
}

export interface TCGPlayerPrices {
  holofoil?: PriceDetails;
}

export interface PriceDetails {
  low: number | null;
  mid: number | null;
  high: number | null;
  market: number | null;
  directLow: number | null;
}

export interface CardMarket {
  url: string;
  updatedAt: string;
  prices: CardMarketPrices;
}

export interface CardMarketPrices {
  averageSellPrice: number;
  lowPrice: number;
  trendPrice: number;
  germanProLow: number;
  suggestedPrice: number;
  reverseHoloSell: number;
  reverseHoloLow: number;
  reverseHoloTrend: number;
  lowPriceExPlus: number;
  avg1: number;
  avg7: number;
  avg30: number;
  reverseHoloAvg1: number;
  reverseHoloAvg7: number;
  reverseHoloAvg30: number;
}
