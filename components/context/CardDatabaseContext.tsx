import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
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

  // Use refs to track mounted state and prevent state updates during dismount
  const isMounted = useRef(true);
  const setIsUpdatingDbRef = useRef(setIsUpdatingDb);

  // Update the ref when the prop changes
  useEffect(() => {
    setIsUpdatingDbRef.current = setIsUpdatingDb;
  }, [setIsUpdatingDb]);

  // Safe state setters that check if component is still mounted
  const safeSetIsUpdating = (state: boolean) => {
    if (isMounted.current) {
      setIsUpdating(state);
      // Use the ref value to avoid closure issues
      if (setIsUpdatingDbRef.current) {
        setIsUpdatingDbRef.current(state);
      }
    }
  };

  useEffect(() => {
    // Reset mounted flag on unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    async function setupDatabase() {
      try {
        // Open or create the card database (fixed name)
        const openedDb = await SQLite.openDatabaseAsync("cardDatabase.db");

        if (isMounted.current) {
          // Run migration and JSON population - use a custom wrapper function
          // that doesn't immediately update state during rendering
          await migrateDbIfNeeded(openedDb, (updating) => {
            // Use setTimeout to defer state updates out of the render cycle
            setTimeout(() => safeSetIsUpdating(updating), 0);
          });

          if (isMounted.current) {
            setDb(openedDb);
          }
        }
      } catch (e) {
        if (isMounted.current) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }

    setupDatabase();
  }, []);

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
