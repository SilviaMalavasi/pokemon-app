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
  watchLists: { id: number; name: string; cards: string }[];
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
  const [watchLists, setWatchLists] = useState<{ id: number; name: string; cards: string }[]>([]);
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

  useEffect(() => {
    async function setupDatabase() {
      try {
        console.log("[UserDB] Attempting to open user database...");
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
      } catch (e) {
        console.error("[UserDB] Failed to initialize user database:", e);
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

    return () => {
      console.log("UserDatabaseProvider unmounted.");
    };
  }, []);

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
        watchLists,
        isLoadingWatchLists,
        watchListsVersion,
        incrementWatchListsVersion,
        lastWatchListId,
        setLastWatchListId,
      }}
    >
      {children}
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
