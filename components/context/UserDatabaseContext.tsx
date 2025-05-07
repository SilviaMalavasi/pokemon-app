import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SQLite from "expo-sqlite";
import { openUserDatabase, migrateUserDbIfNeeded } from "@/lib/userDatabase";

interface UserDatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  error: Error | null;
}

const UserDatabaseContext = createContext<UserDatabaseContextType | undefined>(undefined);

export const UserDatabaseProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function setupDatabase() {
      try {
        console.log("Attempting to open user database...");
        const openedDb = await openUserDatabase();
        console.log("User database opened, migrating if needed...");
        await migrateUserDbIfNeeded(openedDb);
        console.log("User database migration complete.");
        if (isMounted) {
          setDb(openedDb);
        }
      } catch (e) {
        console.error("Failed to initialize user database:", e);
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
      // Consider closing the database if it's open and no longer needed application-wide
      // db?.closeAsync().catch(e => console.error("Failed to close user database:", e));
      // However, for a context that might be used throughout the app's lifecycle,
      // you might not close it here, or manage it more carefully.
      console.log("UserDatabaseProvider unmounted.");
    };
  }, []);

  return <UserDatabaseContext.Provider value={{ db, isLoading, error }}>{children}</UserDatabaseContext.Provider>;
};

export const useUserDatabase = () => {
  const context = useContext(UserDatabaseContext);
  if (context === undefined) {
    throw new Error("useUserDatabase must be used within a UserDatabaseProvider");
  }
  return context;
};
