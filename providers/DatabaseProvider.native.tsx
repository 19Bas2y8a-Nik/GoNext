import type { ReactNode } from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase, DATABASE_NAME } from '../lib/database';

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      {children}
    </SQLiteProvider>
  );
}

