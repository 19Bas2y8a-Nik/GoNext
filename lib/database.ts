import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'gonext.db';
const DATABASE_VERSION = 1;

const SCHEMA = `
PRAGMA journal_mode = 'WAL';
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  visitlater INTEGER NOT NULL DEFAULT 1,
  liked INTEGER NOT NULL DEFAULT 0,
  lat REAL,
  lng REAL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  placeId INTEGER NOT NULL,
  filePath TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (placeId) REFERENCES places(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  startDate TEXT,
  endDate TEXT,
  current INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL,
  placeId INTEGER NOT NULL,
  \`order\` INTEGER NOT NULL DEFAULT 0,
  visited INTEGER NOT NULL DEFAULT 0,
  visitDate TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (placeId) REFERENCES places(id)
);

CREATE TABLE IF NOT EXISTS trip_place_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripPlaceId INTEGER NOT NULL,
  filePath TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (tripPlaceId) REFERENCES trip_places(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_photos_placeId ON photos(placeId);
CREATE INDEX IF NOT EXISTS idx_trip_places_tripId ON trip_places(tripId);
CREATE INDEX IF NOT EXISTS idx_trip_place_photos_tripPlaceId ON trip_place_photos(tripPlaceId);
`;

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(SCHEMA);
  }

  await db.runAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export { DATABASE_NAME };
