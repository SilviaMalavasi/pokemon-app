import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SQLite from "expo-sqlite";
import { migrateDbIfNeeded } from "@/lib/cardDatabase";

interface CardDatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
}

const CardDatabaseContext = createContext<CardDatabaseContextType | undefined>(undefined);

export const CardDatabaseProvider = ({
  children,
  setIsUpdatingDb,
}: {
  children: ReactNode;
  setIsUpdatingDb?: (isUpdating: boolean) => void;
}) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep parent in sync with isUpdating
  useEffect(() => {
    if (setIsUpdatingDb) setIsUpdatingDb(isUpdating);
  }, [isUpdating, setIsUpdatingDb]);

  useEffect(() => {
    let isMounted = true;
    async function setupDatabase() {
      try {
        // Open or create the card database (fixed name)
        const openedDb = await SQLite.openDatabaseAsync("cardDatabase.db");
        // Run migration and JSON population
        await migrateDbIfNeeded(openedDb, (updating) => {
          if (isMounted) setIsUpdating(updating);
          if (setIsUpdatingDb) setIsUpdatingDb(updating);
        });
        if (isMounted) {
          setDb(openedDb);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    setupDatabase();
    return () => {
      isMounted = false;
      // Optionally close db here if needed
    };
  }, [setIsUpdatingDb]);

  return (
    <CardDatabaseContext.Provider value={{ db, isLoading, isUpdating, error }}>{children}</CardDatabaseContext.Provider>
  );
};

export const useCardDatabase = () => {
  const context = useContext(CardDatabaseContext);
  if (context === undefined) {
    throw new Error("useCardDatabase must be used within a CardDatabaseProvider");
  }
  return context;
};
