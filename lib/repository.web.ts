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

function notSupported(method: string): never {
  throw new Error(
    `Метод ${method} не поддерживается в веб-версии. SQLite доступен только в нативных приложениях (iOS/Android).`,
  );
}

export function usePlaceRepository() {
  return {
    async getAll(): Promise<Place[]> {
      // В веб-версии просто показываем пустой список
      return [];
    },

    async getById(_id: number): Promise<Place | null> {
      return null;
    },

    async create(_data: PlaceInsert): Promise<number> {
      return notSupported('places.create');
    },

    async update(_id: number, _data: Partial<PlaceInsert>): Promise<void> {
      notSupported('places.update');
    },

    async delete(_id: number): Promise<void> {
      notSupported('places.delete');
    },
  };
}

export function usePhotoRepository() {
  return {
    async getByPlaceId(_placeId: number): Promise<Photo[]> {
      return [];
    },

    async create(_data: PhotoInsert): Promise<number> {
      return notSupported('photos.create');
    },

    async delete(_id: number): Promise<void> {
      notSupported('photos.delete');
    },
  };
}

export function useTripRepository() {
  return {
    async getAll(): Promise<Trip[]> {
      return [];
    },

    async getById(_id: number): Promise<Trip | null> {
      return null;
    },

    async getCurrent(): Promise<Trip | null> {
      return null;
    },

    async create(_data: TripInsert): Promise<number> {
      return notSupported('trips.create');
    },

    async update(_id: number, _data: Partial<TripInsert>): Promise<void> {
      notSupported('trips.update');
    },

    async delete(_id: number): Promise<void> {
      notSupported('trips.delete');
    },
  };
}

export function useTripPlaceRepository() {
  return {
    async getByTripId(_tripId: number): Promise<(TripPlace & { place?: Place })[]> {
      return [];
    },

    async getNextUnvisited(_tripId: number): Promise<(TripPlace & { place?: Place }) | null> {
      return null;
    },

    async create(_data: TripPlaceInsert): Promise<number> {
      return notSupported('trip_places.create');
    },

    async updateOrder(_id: number, _order: number): Promise<void> {
      notSupported('trip_places.updateOrder');
    },

    async setVisited(_id: number, _visited: boolean, _visitDate?: string | null): Promise<void> {
      notSupported('trip_places.setVisited');
    },

    async updateNotes(_id: number, _notes: string | null): Promise<void> {
      notSupported('trip_places.updateNotes');
    },

    async delete(_id: number): Promise<void> {
      notSupported('trip_places.delete');
    },
  };
}

export function useTripPlacePhotoRepository() {
  return {
    async getByTripPlaceId(_tripPlaceId: number): Promise<TripPlacePhoto[]> {
      return [];
    },

    async create(_data: TripPlacePhotoInsert): Promise<number> {
      return notSupported('trip_place_photos.create');
    },

    async delete(_id: number): Promise<void> {
      notSupported('trip_place_photos.delete');
    },
  };
}

