// helpers/deckLibraryMapping.ts
// This file maps each unique variant family (variantOf) from LimitlessDecks to a thumbnail image.
// Fill in the thumbnail for each variant family manually.

export interface DeckLibraryMapping {
  [variantOf: string]: {
    thumbnail: string; // e.g. 'sv1-1_large.webp' or a custom image path
  };
}

const deckLibraryMapping: DeckLibraryMapping = {
  "Joltik Box": {
    "thumbnail": "sv7-150_large.webp"
  },
  "Tera Box": {
    "thumbnail": "svp-141_large.webp"
  },
  "N's Zoroark": {
    "thumbnail": "sv9-185_large.webp"
  },
  "Dragapult ex": {
    "thumbnail": "sv6-200_large.webp"
  },
  "Gardevoir ex": {
    "thumbnail": "sv1-228_large.webp"
  },
  "Raging Bolt ex": {
    "thumbnail": ""
  },
  "Gholdengo ex": {
    "thumbnail": "sv4-231_large.webp"
  },
  "Flareon ex": {
    "thumbnail": "sv8pt5-146_large.webp"
  },
  "Terapagos ex": {
    "thumbnail": "sv7-170_large.webp"
  },
  "Archaludon ex": {
    "thumbnail": "sv8-224_large.webp"
  },
  "Roaring Moon ex": {
    "thumbnail": ""
  },
  "Charizard ex": {
    "thumbnail": "sv3-215_large.webp"
  },
  "Froslass Munkidori": {
    "thumbnail": "sv6-174_large.webp"
  },
  "Ceruledge ex": {
    "thumbnail": "sv8pt5-147_large.webp"
  },
  "Blissey ex": {
    "thumbnail": "sv6-201_large.webp"
  },
  "Milotic ex": {
    "thumbnail": "sv8-217_large.webp"
  },
  "Espathra ex": {
    "thumbnail": "sv4pt5-214_large.webp"
  },
  "Hop's Zacian": {
    "thumbnail": ""
  },
  "Slowking Seek Inspiration": {
    "thumbnail": "sv8pt5-19_large.webp"
  },
  "Great Tusk Mill": {
    "thumbnail": ""
  },
  "Toedscruel Ogerpon": {
    "thumbnail": "sv3-119_large.webp"
  },
  "Greninja ex": {
    "thumbnail": "sv6-106_large.webp"
  },
  "Hydreigon ex": {
    "thumbnail": "sv8-223_large.webp"
  },
  "Okidogi Adrena-Power": {
    "thumbnail": "sv6pt5-74_large.webp"
  },
  "Future": {
    "thumbnail": ""
  },
  "Gouging Fire ex": {
    "thumbnail": ""
  },
  "Slaking ex": {
    "thumbnail": "sv8-227_large.webp"
  },
  "Tyranitar Daunting Gaze": {
    "thumbnail": "sv2-222_large.webp"
  },
  "Feraligatr Giant Wave": {
    "thumbnail": "svp-89_large.webp"
  },
  "Mamoswine ex": {
    "thumbnail": "sv9-174_large.webp"
  },
  "Lillie's Clefairy ex": {
    "thumbnail": ""
  },
  "Pidgeot Control": {
    "thumbnail": "sv3pt5-18_large.webp"
  },
  "Copperajah ex": {
    "thumbnail": "sv2-245_large.webp"
  },
  "Magmortar Magma Surge": {
    "thumbnail": "sv9-21_large.webp"
  }
};

export default deckLibraryMapping;
