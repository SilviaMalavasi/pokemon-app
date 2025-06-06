import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import * as SQLite from "expo-sqlite";
import { openLimitlessDatabase, migrateLimitlessDbIfNeeded } from "@/lib/limitlessDatabase";

interface LimitlessDatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
}

const LimitlessDatabaseContext = createContext<LimitlessDatabaseContextType | undefined>(undefined);
LimitlessDatabaseContext.displayName = "LimitlessDatabaseContext";

// Add a module-level lock to prevent concurrent DB opens/migrations
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const LimitlessDatabaseProvider = ({
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

  const isMounted = useRef(true);
  const setIsUpdatingDbRef = useRef(setIsUpdatingDb);

  useEffect(() => {
    setIsUpdatingDbRef.current = setIsUpdatingDb;
  }, [setIsUpdatingDb]);

  const safeSetIsUpdating = (state: boolean) => {
    if (isMounted.current) {
      setIsUpdating(state);
      if (setIsUpdatingDbRef.current) {
        setIsUpdatingDbRef.current(state);
      }
    }
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;

  useEffect(() => {
    let retryCount = 0;
    let cancelled = false;

    async function setupDatabaseWithRetry() {
      while (retryCount < MAX_RETRIES && !cancelled) {
        try {
          if (!dbInitPromise) {
            dbInitPromise = openLimitlessDatabase().then(async (openedDb) => {
              await migrateLimitlessDbIfNeeded(openedDb);
              return openedDb;
            });
          }
          const openedDb = await dbInitPromise;
          if (isMounted.current && !cancelled) {
            setDb(openedDb);
          }
          break;
        } catch (e) {
          dbInitPromise = null; // Reset on failure
          retryCount++;
          if (retryCount >= MAX_RETRIES) {
            alert("[DEV] Limitless DB failed to initialize after multiple attempts. See console for details.");
            if (isMounted.current) {
              setError(e instanceof Error ? e : new Error(String(e)));
            }
          } else {
            await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
          }
        } finally {
          if (isMounted.current && !cancelled) {
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
    <LimitlessDatabaseContext.Provider value={{ db, isLoading, isUpdating, error }}>
      {children}
    </LimitlessDatabaseContext.Provider>
  );
};

export const useLimitlessDatabase = () => {
  const context = useContext(LimitlessDatabaseContext);
  if (context === undefined) {
    throw new Error("useLimitlessDatabase must be used within a LimitlessDatabaseProvider");
  }
  return context;
};
