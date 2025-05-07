import React, { createContext, useContext, useState, ReactNode } from "react";

interface DatabaseStateContextType {
  isCardDbUpdating: boolean;
  isUserDbUpdating: boolean;
  setCardDbUpdating: (isUpdating: boolean) => void;
  setUserDbUpdating: (isUpdating: boolean) => void;
  isAnyDbUpdating: boolean;
}

const DatabaseStateContext = createContext<DatabaseStateContextType | undefined>(undefined);

export const DatabaseStateProvider = ({ children }: { children: ReactNode }) => {
  // Set both to true by default so splash is shown immediately
  const [isCardDbUpdating, setCardDbUpdating] = useState(true);
  const [isUserDbUpdating, setUserDbUpdating] = useState(true);

  // Calculate derived state - any database is updating
  const isAnyDbUpdating = isCardDbUpdating || isUserDbUpdating;

  return (
    <DatabaseStateContext.Provider
      value={{
        isCardDbUpdating,
        isUserDbUpdating,
        setCardDbUpdating,
        setUserDbUpdating,
        isAnyDbUpdating,
      }}
    >
      {children}
    </DatabaseStateContext.Provider>
  );
};

export const useDatabaseState = () => {
  const context = useContext(DatabaseStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseState must be used within a DatabaseStateProvider");
  }
  return context;
};
