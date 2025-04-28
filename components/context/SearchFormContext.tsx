import React, { createContext, useContext, useState } from "react";

export type AdvancedSearchFormState = {
  // All fields from AdvancedSearchForm
  cardSupertype: string[];
  cardSubtypes: string[];
  cardName: string;
  cardHp: number | "";
  cardHpOperator: string;
  cardTypes: string[];
  cardEvolvesFrom: string;
  cardEvolvesTo: string;
  cardRules: string;
  abilitiesName: string;
  abilitiesText: string;
  attacksName: string;
  attacksDamage: number | "";
  attacksDamageOperator: string;
  attacksText: string;
  attacksCost: string[];
  attacksConvertedEnergyCost: number | "";
  attacksConvertedEnergyCostOperator: string;
  cardWeaknessesType: string[];
  cardResistancesType: string[];
  cardConvertedRetreatCost: number | "";
  cardConvertedRetreatCostOperator: string;
  cardArtist: string;
  cardFlavor: string;
  cardRegulationMark: string[];
  cardSetName: string[];
  cardNumber: number | "";
  cardStage: string[];
  cardSetNumber: string;
  hasAnyAbility: boolean;
  attacksCostSlots: string[];
  // Remove duplicates
  removeDuplicates: boolean;
};

export type FreeSearchFormState = {
  cardSearch: string;
  includedColumns: Record<string, boolean>;
  removeDuplicates: boolean;
};

export type SearchFormContextType = {
  lastSearchPage: "advanced" | "free" | null;
  advancedForm: AdvancedSearchFormState | null;
  setAdvancedForm: (state: AdvancedSearchFormState) => void;
  clearAdvancedForm: () => void;
  freeForm: FreeSearchFormState | null;
  setFreeForm: (state: FreeSearchFormState) => void;
  clearFreeForm: () => void;
  setLastSearchPage: (type: "advanced" | "free" | null) => void;
};

const defaultAdvancedForm: AdvancedSearchFormState = {
  cardSupertype: [],
  cardSubtypes: [],
  cardName: "",
  cardHp: "",
  cardHpOperator: "=",
  cardTypes: [],
  cardEvolvesFrom: "",
  cardEvolvesTo: "",
  cardRules: "",
  abilitiesName: "",
  abilitiesText: "",
  attacksName: "",
  attacksDamage: "",
  attacksDamageOperator: "=",
  attacksText: "",
  attacksCost: [],
  attacksConvertedEnergyCost: "",
  attacksConvertedEnergyCostOperator: "=",
  cardWeaknessesType: [],
  cardResistancesType: [],
  cardConvertedRetreatCost: "",
  cardConvertedRetreatCostOperator: "=",
  cardArtist: "",
  cardFlavor: "",
  cardRegulationMark: [],
  cardSetName: [],
  cardNumber: "",
  cardStage: [],
  cardSetNumber: "",
  hasAnyAbility: false,
  attacksCostSlots: [],
  removeDuplicates: false,
};

const defaultFreeForm: FreeSearchFormState = {
  cardSearch: "",
  includedColumns: {},
  removeDuplicates: false,
};

const SearchFormContext = createContext<SearchFormContextType | undefined>(undefined);

export function useSearchFormContext() {
  const ctx = useContext(SearchFormContext);
  if (!ctx) throw new Error("useSearchFormContext must be used within SearchFormProvider");
  return ctx;
}

export const SearchFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastSearchPage, setLastSearchPage] = useState<"advanced" | "free" | null>(null);
  const [advancedForm, setAdvancedFormState] = useState<AdvancedSearchFormState | null>(null);
  const [freeForm, setFreeFormState] = useState<FreeSearchFormState | null>(null);

  const setAdvancedForm = (state: AdvancedSearchFormState) => setAdvancedFormState(state);
  const clearAdvancedForm = () => setAdvancedFormState(null);
  const setFreeForm = (state: FreeSearchFormState) => setFreeFormState(state);
  const clearFreeForm = () => setFreeFormState(null);

  return (
    <SearchFormContext.Provider
      value={{
        lastSearchPage,
        advancedForm,
        setAdvancedForm,
        clearAdvancedForm,
        freeForm,
        setFreeForm,
        clearFreeForm,
        setLastSearchPage,
      }}
    >
      {children}
    </SearchFormContext.Provider>
  );
};
