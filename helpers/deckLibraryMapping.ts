// helpers/deckLibraryMapping.ts
// This file maps each unique variant family (variantOf) from LimitlessDecks to a thumbnail image.
// Fill in the thumbnail for each variant family manually.

export interface DeckLibraryMapping {
  [variantOf: string]: {
    thumbnail: string;
  };
}

const deckLibraryMapping: DeckLibraryMapping = {
  "Dragapult ex": {
    thumbnail: "sv6-200_large.webp",
  },
  "Gardevoir ex": {
    thumbnail: "sv1-228_large.webp",
  },
  "Raging Bolt ex": {
    thumbnail: "sv5-123_large.webp",
  },
  "Gholdengo ex": {
    thumbnail: "sv4-231_large.webp",
  },
  "Joltik Box": {
    thumbnail: "sv4-196_large.webp",
  },
  "Tera Box": {
    thumbnail: "svp-141_large.webp",
  },
  "Flareon ex": {
    thumbnail: "sv8pt5-146_large.webp",
  },
  "Terapagos ex": {
    thumbnail: "sv7-170_large.webp",
  },
  "N's Zoroark": {
    thumbnail: "sv9-185_large.webp",
  },
  "Archaludon ex": {
    thumbnail: "sv8-224_large.webp",
  },
  "Roaring Moon ex": {
    thumbnail: "sv4-124_large.webp",
  },
  "Charizard ex": {
    thumbnail: "sv3-215_large.webp",
  },
  "Froslass Munkidori": {
    thumbnail: "sv6-174_large.webp",
  },
  "Ceruledge ex": {
    thumbnail: "sv8pt5-147_large.webp",
  },
  "Blissey ex": {
    thumbnail: "sv6-201_large.webp",
  },
  "Milotic ex": {
    thumbnail: "sv8-217_large.webp",
  },
  "Espathra ex": {
    thumbnail: "sv4pt5-214_large.webp",
  },
  "Hop's Zacian": {
    thumbnail: "sv9-111_large.webp",
  },
  "Slowking Seek Inspiration": {
    thumbnail: "sv8pt5-19_large.webp",
  },
  "Great Tusk Mill": {
    thumbnail: "sv1-123_large.webp",
  },
  "Toedscruel Ogerpon": {
    thumbnail: "sv3-119_large.webp",
  },
  "Greninja ex": {
    thumbnail: "sv6-106_large.webp",
  },
  "Hydreigon ex": {
    thumbnail: "sv8-223_large.webp",
  },
  "Okidogi Adrena-Power": {
    thumbnail: "sv6pt5-74_large.webp",
  },
  Future: {
    thumbnail: "sv5-81_large.webp",
  },
  "Gouging Fire ex": {
    thumbnail: "sv5-188_large.webp",
  },
  "Slaking ex": {
    thumbnail: "sv8-227_large.webp",
  },
  "Tyranitar Daunting Gaze": {
    thumbnail: "sv2-222_large.webp",
  },
  "Feraligatr Giant Wave": {
    thumbnail: "svp-89_large.webp",
  },
  "Mamoswine ex": {
    thumbnail: "sv9-174_large.webp",
  },
  "Lillie's Clefairy ex": {
    thumbnail: "sv9-56_large.webp",
  },
  "Pidgeot Control": {
    thumbnail: "sv3-225_large.webp",
  },
  "Copperajah ex": {
    thumbnail: "sv2-245_large.webp",
  },
  "Magmortar Magma Surge": {
    thumbnail: "sv9-21_large.webp",
  },
};

export default deckLibraryMapping;
