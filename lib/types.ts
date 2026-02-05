export interface Place {
  id: number;
  name: string;
  description: string | null;
  visitlater: boolean;
  liked: boolean;
  lat: number | null;
  lng: number | null;
  createdAt: string;
}

export interface Photo {
  id: number;
  placeId: number;
  filePath: string;
  createdAt: string;
}

export interface Trip {
  id: number;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  createdAt: string;
}

export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: boolean;
  visitDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TripPlacePhoto {
  id: number;
  tripPlaceId: number;
  filePath: string;
  createdAt: string;
}

export interface PlaceInsert {
  name: string;
  description?: string | null;
  visitlater?: boolean;
  liked?: boolean;
  lat?: number | null;
  lng?: number | null;
}

export interface PhotoInsert {
  placeId: number;
  filePath: string;
}

export interface TripInsert {
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
}

export interface TripPlaceInsert {
  tripId: number;
  placeId: number;
  order?: number;
  visited?: boolean;
  visitDate?: string | null;
  notes?: string | null;
}

export interface TripPlacePhotoInsert {
  tripPlaceId: number;
  filePath: string;
}
