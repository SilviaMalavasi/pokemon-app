import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import * as SQLite from "expo-sqlite";
import { openUserDatabase, migrateUserDbIfNeeded } from "@/lib/userDatabase";

interface UserDatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  workingDeckId: string | undefined;
  setWorkingDeckId: (id: string | undefined) => void;
  decksVersion: number;
  incrementDecksVersion: () => void;
  decks: { id: number; name: string; thumbnail: string | null; cards: string }[];
  isLoadingDecks: boolean;
  watchLists: { id: number; name: string; thumbnail: string | null; cards: string }[];
  isLoadingWatchLists: boolean;
  watchListsVersion: number;
  incrementWatchListsVersion: () => void;
  lastWatchListId: number | null;
  setLastWatchListId: (id: number | null) => void;
}

const UserDatabaseContext = createContext<UserDatabaseContextType | undefined>(undefined);

export const UserDatabaseProvider = ({
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
  const [workingDeckId, setWorkingDeckId] = useState<string | undefined>(undefined);
  const [decksVersion, setDecksVersion] = useState(0);
  const [decks, setDecks] = useState<{ id: number; name: string; thumbnail: string | null; cards: string }[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [watchLists, setWatchLists] = useState<{ id: number; name: string; thumbnail: string | null; cards: string }[]>(
    []
  );
  const [isLoadingWatchLists, setIsLoadingWatchLists] = useState(false);
  const [watchListsVersion, setWatchListsVersion] = useState(0);
  const [lastWatchListId, setLastWatchListId] = useState<number | null>(null);

  const incrementDecksVersion = () => setDecksVersion((v) => v + 1);
  const incrementWatchListsVersion = () => setWatchListsVersion((v) => v + 1);

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
          console.log(`[UserDB] Attempting to open user database... (try ${retryCount + 1})`);
          const openedDb = await openUserDatabase();
          console.log("[UserDB] Database opened successfully");
          if (isMounted.current) {
            console.log("[UserDB] Migrating user database if needed...");
            await migrateUserDbIfNeeded(openedDb, (updating) => {
              setTimeout(() => safeSetIsUpdating(updating), 0);
            });
            console.log("[UserDB] Migration complete");
            if (isMounted.current) {
              setDb(openedDb);
              console.log("[UserDB] setDb called");
            }
          }
          break; // Success, exit retry loop
        } catch (e) {
          retryCount++;
          console.error(`[UserDB] Failed to initialize user database (attempt ${retryCount}):`, e);
          if (retryCount >= MAX_RETRIES) {
            // Dev only: fire alert on repeated failure
            // eslint-disable-next-line no-alert
            alert("[DEV] User DB failed to initialize after multiple attempts. See console for details.");
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
      console.log("UserDatabaseProvider unmounted.");
    };
  }, []);

  useEffect(() => {
    if (!db) return;
    setIsLoadingDecks(true);
    import("@/lib/userDatabase").then(({ getSavedDecks }) => {
      getSavedDecks(db)
        .then((decks) => setDecks(decks))
        .catch((e) => setDecks([]))
        .finally(() => setIsLoadingDecks(false));
    });
  }, [db, decksVersion]);

  useEffect(() => {
    if (!db) return;
    setIsLoadingWatchLists(true);
    import("@/lib/userDatabase").then(({ getWatchLists }) => {
      getWatchLists(db)
        .then((lists) => setWatchLists(lists))
        .catch((e) => setWatchLists([]))
        .finally(() => setIsLoadingWatchLists(false));
    });
  }, [db, watchListsVersion]);

  return (
    <UserDatabaseContext.Provider
      value={{
        db,
        isLoading,
        isUpdating,
        error,
        workingDeckId,
        setWorkingDeckId,
        decksVersion,
        incrementDecksVersion,
        decks,
        isLoadingDecks,
        watchLists,
        isLoadingWatchLists,
        watchListsVersion,
        incrementWatchListsVersion,
        lastWatchListId,
        setLastWatchListId,
      }}
    >
      {/* Prevent rendering children until DB is ready */}
      {!isLoading && db ? children : null}
    </UserDatabaseContext.Provider>
  );
};

export const useUserDatabase = () => {
  const context = useContext(UserDatabaseContext);
  if (context === undefined) {
    throw new Error("useUserDatabase must be used within a UserDatabaseProvider");
  }
  return context;
};
