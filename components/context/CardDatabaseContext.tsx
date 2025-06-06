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
CardDatabaseContext.displayName = "CardDatabaseContext";

// Module-level lock to prevent concurrent DB opens/migrations
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const CardDatabaseProvider = ({
  children,
  setIsUpdatingDb,
  setCardDbProgress,
}: {
  children: ReactNode;
  setIsUpdatingDb?: (isUpdating: boolean) => void;
  setCardDbProgress?: (progress: number) => void;
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

  // Retry logic constants
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;

  useEffect(() => {
    let retryCount = 0;
    let cancelled = false;

    async function setupDatabaseWithRetry() {
      while (retryCount < MAX_RETRIES && !cancelled) {
        try {
          if (!dbInitPromise) {
            dbInitPromise = (async () => {
              // Open or create the card database (fixed name)
              console.log(`[CardDB] Attempting to open card database... (try ${retryCount + 1})`);
              const openedDb = await SQLite.openDatabaseAsync("cardDatabase.db");
              if (isMounted.current) {
                // Run migration and JSON population
                await migrateDbIfNeeded(
                  openedDb,
                  (updating) => {
                    setTimeout(() => safeSetIsUpdating(updating), 0);
                  },
                  setCardDbProgress
                );
              }
              return openedDb;
            })();
          }
          const openedDb = await dbInitPromise;
          if (isMounted.current) {
            setDb(openedDb);
          }
          break; // Success, exit retry loop
        } catch (e) {
          retryCount++;
          dbInitPromise = null; // Reset lock on failure so next attempt can retry
          console.error(`[CardDB] Failed to initialize card database (attempt ${retryCount}):`, e);
          if (retryCount >= MAX_RETRIES) {
            // Dev only: fire alert on repeated failure
            // eslint-disable-next-line no-alert
            alert("[DEV] Card DB failed to initialize after multiple attempts. See console for details.");
            if (isMounted.current) {
              setError(e instanceof Error ? e : new Error(String(e)));
            }
          } else {
            // Wait before retrying
            await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
          }
        } finally {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      }
    }

    setupDatabaseWithRetry();

    return () => {
      cancelled = true;
      isMounted.current = false;
    };
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
