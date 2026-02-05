import { useSQLiteContext } from 'expo-sqlite';
import type {
  Place,
  Photo,
  Trip,
  TripPlace,
  TripPlacePhoto,
  PlaceInsert,
  PhotoInsert,
  TripInsert,
  TripPlaceInsert,
  TripPlacePhotoInsert,
} from './types';

function toIsoString(): string {
  return new Date().toISOString();
}

function rowToPlace(row: Record<string, unknown>): Place {
  return {
    id: row.id as number,
    name: row.name as string,
    description: (row.description as string) || null,
    visitlater: !!(row.visitlater as number),
    liked: !!(row.liked as number),
    lat: row.lat != null ? (row.lat as number) : null,
    lng: row.lng != null ? (row.lng as number) : null,
    createdAt: row.createdAt as string,
  };
}

function rowToPhoto(row: Record<string, unknown>): Photo {
  return {
    id: row.id as number,
    placeId: row.placeId as number,
    filePath: row.filePath as string,
    createdAt: row.createdAt as string,
  };
}

function rowToTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as number,
    title: row.title as string,
    description: (row.description as string) || null,
    startDate: (row.startDate as string) || null,
    endDate: (row.endDate as string) || null,
    current: !!(row.current as number),
    createdAt: row.createdAt as string,
  };
}

function rowToTripPlace(row: Record<string, unknown>): TripPlace {
  return {
    id: row.id as number,
    tripId: row.tripId as number,
    placeId: row.placeId as number,
    order: row.order as number,
    visited: !!(row.visited as number),
    visitDate: (row.visitDate as string) || null,
    notes: (row.notes as string) || null,
    createdAt: row.createdAt as string,
  };
}

function rowToTripPlacePhoto(row: Record<string, unknown>): TripPlacePhoto {
  return {
    id: row.id as number,
    tripPlaceId: row.tripPlaceId as number,
    filePath: row.filePath as string,
    createdAt: row.createdAt as string,
  };
}

export function usePlaceRepository() {
  const db = useSQLiteContext();

  return {
    async getAll(): Promise<Place[]> {
      const rows = await db.getAllAsync('SELECT * FROM places ORDER BY createdAt DESC');
      return rows.map((r) => rowToPlace(r as Record<string, unknown>));
    },

    async getById(id: number): Promise<Place | null> {
      const row = await db.getFirstAsync('SELECT * FROM places WHERE id = ?', id);
      return row ? rowToPlace(row as Record<string, unknown>) : null;
    },

    async create(data: PlaceInsert): Promise<number> {
      const result = await db.runAsync(
        `INSERT INTO places (name, description, visitlater, liked, lat, lng, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        data.name,
        data.description ?? null,
        data.visitlater !== false ? 1 : 0,
        data.liked ? 1 : 0,
        data.lat ?? null,
        data.lng ?? null,
        toIsoString()
      );
      return result.lastInsertRowId;
    },

    async update(id: number, data: Partial<PlaceInsert>): Promise<void> {
      const place = await this.getById(id);
      if (!place) return;
      await db.runAsync(
        `UPDATE places SET name = ?, description = ?, visitlater = ?, liked = ?, lat = ?, lng = ?
         WHERE id = ?`,
        data.name ?? place.name,
        data.description !== undefined ? data.description : place.description,
        data.visitlater !== undefined ? (data.visitlater ? 1 : 0) : (place.visitlater ? 1 : 0),
        data.liked !== undefined ? (data.liked ? 1 : 0) : (place.liked ? 1 : 0),
        data.lat !== undefined ? data.lat : place.lat,
        data.lng !== undefined ? data.lng : place.lng,
        id
      );
    },

    async delete(id: number): Promise<void> {
      await db.runAsync('DELETE FROM places WHERE id = ?', id);
    },
  };
}

export function usePhotoRepository() {
  const db = useSQLiteContext();

  return {
    async getByPlaceId(placeId: number): Promise<Photo[]> {
      const rows = await db.getAllAsync('SELECT * FROM photos WHERE placeId = ? ORDER BY createdAt', placeId);
      return rows.map((r) => rowToPhoto(r as Record<string, unknown>));
    },

    async create(data: PhotoInsert): Promise<number> {
      const result = await db.runAsync(
        'INSERT INTO photos (placeId, filePath, createdAt) VALUES (?, ?, ?)',
        data.placeId,
        data.filePath,
        toIsoString()
      );
      return result.lastInsertRowId;
    },

    async delete(id: number): Promise<void> {
      await db.runAsync('DELETE FROM photos WHERE id = ?', id);
    },
  };
}

export function useTripRepository() {
  const db = useSQLiteContext();

  return {
    async getAll(): Promise<Trip[]> {
      const rows = await db.getAllAsync('SELECT * FROM trips ORDER BY createdAt DESC');
      return rows.map((r) => rowToTrip(r as Record<string, unknown>));
    },

    async getById(id: number): Promise<Trip | null> {
      const row = await db.getFirstAsync('SELECT * FROM trips WHERE id = ?', id);
      return row ? rowToTrip(row as Record<string, unknown>) : null;
    },

    async getCurrent(): Promise<Trip | null> {
      const row = await db.getFirstAsync('SELECT * FROM trips WHERE current = 1 LIMIT 1');
      return row ? rowToTrip(row as Record<string, unknown>) : null;
    },

    async create(data: TripInsert): Promise<number> {
      if (data.current) {
        await db.runAsync('UPDATE trips SET current = 0');
      }
      const result = await db.runAsync(
        `INSERT INTO trips (title, description, startDate, endDate, current, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        data.title,
        data.description ?? null,
        data.startDate ?? null,
        data.endDate ?? null,
        data.current ? 1 : 0,
        toIsoString()
      );
      return result.lastInsertRowId;
    },

    async update(id: number, data: Partial<TripInsert>): Promise<void> {
      const trip = await this.getById(id);
      if (!trip) return;
      if (data.current) {
        await db.runAsync('UPDATE trips SET current = 0');
      }
      await db.runAsync(
        `UPDATE trips SET title = ?, description = ?, startDate = ?, endDate = ?, current = ?
         WHERE id = ?`,
        data.title ?? trip.title,
        data.description !== undefined ? data.description : trip.description,
        data.startDate !== undefined ? data.startDate : trip.startDate,
        data.endDate !== undefined ? data.endDate : trip.endDate,
        data.current !== undefined ? (data.current ? 1 : 0) : (trip.current ? 1 : 0),
        id
      );
    },

    async delete(id: number): Promise<void> {
      await db.runAsync('DELETE FROM trips WHERE id = ?', id);
    },
  };
}

export function useTripPlaceRepository() {
  const db = useSQLiteContext();

  return {
    async getByTripId(tripId: number): Promise<(TripPlace & { place?: Place })[]> {
      const rows = await db.getAllAsync(
        `SELECT tp.*, p.name, p.description, p.visitlater, p.liked, p.lat, p.lng, p.createdAt as place_createdAt
         FROM trip_places tp
         LEFT JOIN places p ON tp.placeId = p.id
         WHERE tp.tripId = ?
         ORDER BY tp.\`order\` ASC, tp.id ASC`,
        tripId
      );
      return rows.map((r) => {
        const row = r as Record<string, unknown>;
        const tp = rowToTripPlace(row);
        const place = row.name != null
          ? rowToPlace({
              id: row.placeId,
              name: row.name,
              description: row.description,
              visitlater: row.visitlater,
              liked: row.liked,
              lat: row.lat,
              lng: row.lng,
              createdAt: row.place_createdAt,
            } as Record<string, unknown>)
          : undefined;
        return { ...tp, place };
      });
    },

    async getNextUnvisited(tripId: number): Promise<(TripPlace & { place?: Place }) | null> {
      const rows = await db.getAllAsync(
        `SELECT tp.*, p.name, p.description, p.visitlater, p.liked, p.lat, p.lng, p.createdAt as place_createdAt
         FROM trip_places tp
         LEFT JOIN places p ON tp.placeId = p.id
         WHERE tp.tripId = ? AND tp.visited = 0
         ORDER BY tp.\`order\` ASC, tp.id ASC
         LIMIT 1`,
        tripId
      );
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      const tp = rowToTripPlace(row);
      const place = row.name != null
        ? rowToPlace({
            id: row.placeId,
            name: row.name,
            description: row.description,
            visitlater: row.visitlater,
            liked: row.liked,
            lat: row.lat,
            lng: row.lng,
            createdAt: row.place_createdAt,
          } as Record<string, unknown>)
        : undefined;
      return { ...tp, place };
    },

    async create(data: TripPlaceInsert): Promise<number> {
      const maxOrder = await db.getFirstAsync<{ max: number | null }>(
        'SELECT MAX(`order`) as max FROM trip_places WHERE tripId = ?',
        data.tripId
      );
      const order = data.order ?? ((maxOrder?.max ?? -1) + 1);
      const result = await db.runAsync(
        `INSERT INTO trip_places (tripId, placeId, \`order\`, visited, visitDate, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        data.tripId,
        data.placeId,
        order,
        data.visited ? 1 : 0,
        data.visitDate ?? null,
        data.notes ?? null,
        toIsoString()
      );
      return result.lastInsertRowId;
    },

    async updateOrder(id: number, order: number): Promise<void> {
      await db.runAsync('UPDATE trip_places SET `order` = ? WHERE id = ?', order, id);
    },

    async setVisited(id: number, visited: boolean, visitDate?: string | null): Promise<void> {
      await db.runAsync(
        'UPDATE trip_places SET visited = ?, visitDate = ? WHERE id = ?',
        visited ? 1 : 0,
        visitDate ?? null,
        id
      );
    },

    async updateNotes(id: number, notes: string | null): Promise<void> {
      await db.runAsync('UPDATE trip_places SET notes = ? WHERE id = ?', notes, id);
    },

    async delete(id: number): Promise<void> {
      await db.runAsync('DELETE FROM trip_places WHERE id = ?', id);
    },
  };
}

export function useTripPlacePhotoRepository() {
  const db = useSQLiteContext();

  return {
    async getByTripPlaceId(tripPlaceId: number): Promise<TripPlacePhoto[]> {
      const rows = await db.getAllAsync(
        'SELECT * FROM trip_place_photos WHERE tripPlaceId = ? ORDER BY createdAt',
        tripPlaceId
      );
      return rows.map((r) => rowToTripPlacePhoto(r as Record<string, unknown>));
    },

    async create(data: TripPlacePhotoInsert): Promise<number> {
      const result = await db.runAsync(
        'INSERT INTO trip_place_photos (tripPlaceId, filePath, createdAt) VALUES (?, ?, ?)',
        data.tripPlaceId,
        data.filePath,
        toIsoString()
      );
      return result.lastInsertRowId;
    },

    async delete(id: number): Promise<void> {
      await db.runAsync('DELETE FROM trip_place_photos WHERE id = ?', id);
    },
  };
}
