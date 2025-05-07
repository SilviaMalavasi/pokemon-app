import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import * as SQLite from "expo-sqlite";
import { openUserDatabase, migrateUserDbIfNeeded } from "@/lib/userDatabase";

interface UserDatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
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
        console.log("Attempting to open user database...");
        const openedDb = await openUserDatabase();

        if (isMounted.current) {
          console.log("User database opened, migrating if needed...");
          // Use a setTimeout to defer state updates out of the render cycle
          await migrateUserDbIfNeeded(openedDb, (updating) => {
            setTimeout(() => safeSetIsUpdating(updating), 0);
          });
          console.log("User database migration complete.");

          if (isMounted.current) {
            setDb(openedDb);
          }
        }
      } catch (e) {
        console.error("Failed to initialize user database:", e);
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

  return (
    <UserDatabaseContext.Provider value={{ db, isLoading, isUpdating, error }}>{children}</UserDatabaseContext.Provider>
  );
};

export const useUserDatabase = () => {
  const context = useContext(UserDatabaseContext);
  if (context === undefined) {
    throw new Error("useUserDatabase must be used within a UserDatabaseProvider");
  }
  return context;
};
