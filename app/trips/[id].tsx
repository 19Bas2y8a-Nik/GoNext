import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View, Image, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  List,
  Text,
  TextInput,
  IconButton,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import type { Trip, TripPlace, TripPlacePhoto } from '../../lib/types';
import {
  usePlaceRepository,
  useTripPlacePhotoRepository,
  useTripPlaceRepository,
  useTripRepository,
} from '../../lib/repository';

type TripPlaceWithPlace = TripPlace & {
  place?: {
    id: number;
    name: string;
    description: string | null;
    lat: number | null;
    lng: number | null;
  };
};

type TripPlaceWithPlaceAndPhotos = TripPlaceWithPlace & {
  photos: TripPlacePhoto[];
};

function formatDate(date: string | null): string | null {
  return date || null;
}

function getTripStatusLabel(
  trip: Trip | null,
  places: TripPlaceWithPlace[],
  t: (key: string) => string,
): string {
  if (!trip) return '';
  const now = new Date();
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : null;
  const anyVisited = places.some((p) => p.visited);
  const allVisited = places.length > 0 && places.every((p) => p.visited);

  if (!start && !end) {
    return anyVisited ? t('trips.diary') : t('trips.plan');
  }

  if (end && now > end) {
    return allVisited ? t('trips.diaryCompleted') : t('trips.diaryUnvisited');
  }

  if (start && now < start) {
    return t('trips.plan');
  }

  return anyVisited ? t('trips.diary') : t('trips.plan');
}

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const tripRepo = useTripRepository();
  const tripPlaceRepo = useTripPlaceRepository();
  const placeRepo = usePlaceRepository();
  const tripPlacePhotoRepo = useTripPlacePhotoRepository();

  const tripId = Number(id);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<TripPlaceWithPlaceAndPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [previewPhotoUri, setPreviewPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(tripId)) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const load = async () => {
      try {
        const [t, tp] = await Promise.all([
          tripRepo.getById(tripId),
          tripPlaceRepo.getByTripId(tripId),
        ]);
        if (!isMounted) return;

        setTrip(t);
        // Загружаем связанные места и фотографии для каждой точки маршрута
        const photosLists = await Promise.all(
          tp.map((item) => tripPlacePhotoRepo.getByTripPlaceId(item.id)),
        );

        const withPlaces: TripPlaceWithPlaceAndPhotos[] = [];
        for (let index = 0; index < tp.length; index++) {
          const item = tp[index]!;
          const photos = photosLists[index] ?? [];

          if (item.place) {
            withPlaces.push({
              ...item,
              place: {
                id: item.place.id,
                name: item.place.name,
                description: item.place.description,
                lat: item.place.lat,
                lng: item.place.lng,
              },
              photos,
            });
          } else {
            const p = await placeRepo.getById(item.placeId);
            withPlaces.push({
              ...item,
              place: p
                ? {
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    lat: p.lat,
                    lng: p.lng,
                  }
                : undefined,
              photos,
            });
          }
        }
        if (!isMounted) return;
        setPlaces(withPlaces);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [tripId, tripRepo, tripPlaceRepo, placeRepo]);

  const statusLabel = useMemo(() => getTripStatusLabel(trip, places, t), [trip, places, t]);

  const movePlace = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= places.length) return;
    const updated = [...places];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setPlaces(updated);
    // Обновляем порядок в БД
    await Promise.all(
      updated.map((item, idx) => tripPlaceRepo.updateOrder(item.id, idx)),
    );
  };

  const toggleVisited = async (item: TripPlaceWithPlaceAndPhotos) => {
    try {
      setUpdating(true);
      const newVisited = !item.visited;
      const visitDate = newVisited ? new Date().toISOString().slice(0, 10) : null;
      await tripPlaceRepo.setVisited(item.id, newVisited, visitDate);
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, visited: newVisited, visitDate } : p,
        ),
      );
    } catch {
      Alert.alert(t('errors.error'), t('errors.updateStatusFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const updateNotes = async (item: TripPlaceWithPlaceAndPhotos, notes: string) => {
    try {
      setUpdating(true);
      await tripPlaceRepo.updateNotes(item.id, notes || null);
      setPlaces((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, notes } : p)),
      );
    } catch {
      Alert.alert(t('errors.error'), t('errors.saveNotesFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const openPlaceOnMap = (item: TripPlaceWithPlaceAndPhotos) => {
    if (!item.place || item.place.lat == null || item.place.lng == null) {
      Alert.alert(t('errors.noCoords'), t('errors.noCoordsDescription'));
      return;
    }
    const url = `https://maps.google.com/?q=${item.place.lat},${item.place.lng}`;
    void Linking.openURL(url);
  };

  const openPlaceCard = (item: TripPlaceWithPlaceAndPhotos) => {
    if (!item.place) return;
    router.push(`/places/${item.place.id}` as Href);
  };

  const getTripPlacePhotosDir = (tripPlaceId: number): string => {
    const base = FileSystem.documentDirectory ?? '';
    return `${base}trip_places/${tripPlaceId}/`;
  };

  const handleAddPhoto = async (item: TripPlaceWithPlaceAndPhotos) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      const asset = result.assets[0]!;
      if (!asset.uri) return;

      const dir = getTripPlacePhotosDir(item.id);
      try {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      } catch {
        // уже есть или не удалось создать — пробуем дальше
      }
      const ext = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const dest = `${dir}${fileName}`;
      await FileSystem.copyAsync({ from: asset.uri, to: dest });
      const newId = await tripPlacePhotoRepo.create({
        tripPlaceId: item.id,
        filePath: dest,
      });
      const newPhoto: TripPlacePhoto = {
        id: newId,
        tripPlaceId: item.id,
        filePath: dest,
        createdAt: new Date().toISOString(),
      };
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, photos: [newPhoto, ...(p.photos ?? [])] } : p,
        ),
      );
    } catch {
      Alert.alert(t('errors.error'), t('errors.addPhotoFailed'));
    }
  };

  const handleDeletePhoto = async (tripPlaceId: number, photo: TripPlacePhoto) => {
    try {
      if (photo.filePath) {
        try {
          await FileSystem.deleteAsync(photo.filePath, { idempotent: true });
        } catch {
          // игнорируем
        }
      }
      await tripPlacePhotoRepo.delete(photo.id);
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === tripPlaceId
            ? { ...p, photos: (p.photos ?? []).filter((ph) => ph.id !== photo.id) }
            : p,
        ),
      );
      if (previewPhotoUri === photo.filePath) {
        setPreviewPhotoUri(null);
      }
    } catch {
      Alert.alert(t('errors.error'), t('errors.deletePhotoFailed'));
    }
  };

  const deleteTrip = () => {
    if (!trip) return;
    Alert.alert(t('trips.deleteTitle'), t('trips.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            // Удаляем все файлы фотографий, связанные с точками маршрута
            for (const item of places) {
              const photos = await tripPlacePhotoRepo.getByTripPlaceId(item.id);
              for (const photo of photos) {
                if (photo.filePath) {
                  try {
                    await FileSystem.deleteAsync(photo.filePath, { idempotent: true });
                  } catch {
                    // игнорируем отдельные ошибки
                  }
                }
                await tripPlacePhotoRepo.delete(photo.id);
              }
            }
            await tripRepo.delete(trip.id);
            router.replace('/trips' as Href);
          } catch {
            Alert.alert(t('errors.error'), t('errors.deleteTripFailed'));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('trips.trip')} />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </>
    );
  }

  if (!trip) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('trips.trip')} />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>{t('trips.notFound')}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={trip.title} />
        <Appbar.Action icon="delete" onPress={deleteTrip} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Title title={trip.title} />
          <Card.Content>
            {trip.description ? (
              <Text style={styles.paragraph}>{trip.description}</Text>
            ) : (
              <Text style={styles.paragraphMuted}>{t('places.descriptionNotSet')}</Text>
            )}
            <Text style={styles.field}>
              {t('trips.dates')}: {formatDate(trip.startDate) || '—'} — {formatDate(trip.endDate) || '—'}
            </Text>
            <Text style={styles.field}>{t('trips.currentTrip')}: {trip.current ? t('common.yes') : t('common.no')}</Text>
            {statusLabel ? (
              <Chip style={styles.chip} compact>
                {statusLabel}
              </Chip>
            ) : null}
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('trips.route')}
          </Text>
          {places.length === 0 ? (
            <Text style={styles.paragraphMuted}>
              {t('trips.routeEmpty')}
            </Text>
          ) : (
            places.map((item, index) => (
              <Card key={item.id} style={styles.placeCard}>
                <Card.Title
                  title={`${index + 1}. ${item.place?.name ?? t('places.placeRemoved')}`}
                  subtitle={
                    item.place?.description
                      ? item.place.description
                      : t('places.descriptionNotSet')
                  }
                />
                <Card.Content>
                  <View style={styles.rowBetween}>
                    <Chip
                      compact
                      icon={item.visited ? 'check-circle' : 'clock-outline'}
                      onPress={() => void toggleVisited(item)}
                    >
                      {item.visited ? t('trips.visited') : t('trips.notVisited')}
                    </Chip>
                    <View style={styles.orderButtons}>
                      <Button
                        icon="arrow-up"
                        compact
                        mode="text"
                        onPress={() => void movePlace(index, -1)}
                        disabled={index === 0 || updating}
                      />
                      <Button
                        icon="arrow-down"
                        compact
                        mode="text"
                        onPress={() => void movePlace(index, 1)}
                        disabled={index === places.length - 1 || updating}
                      />
                    </View>
                  </View>
                  <Text style={styles.field}>
                    {t('trips.visitDate')}:{' '}
                    {item.visitDate ? formatDate(item.visitDate) : t('trips.visitDateNotSet')}
                  </Text>
                  <TextInput
                    label={t('trips.notes')}
                    value={item.notes ?? ''}
                    onChangeText={(text) => void updateNotes(item, text)}
                    mode="outlined"
                    multiline
                    style={styles.notesInput}
                  />
                  <View style={styles.buttonsRow}>
                    <Button
                      mode="contained"
                      onPress={() => openPlaceOnMap(item)}
                      disabled={!item.place || item.place.lat == null || item.place.lng == null}
                    >
                      {t('common.openOnMap')}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => openPlaceCard(item)}
                      disabled={!item.place}
                    >
                      {t('common.placeCard')}
                    </Button>
                  </View>
                  <View style={styles.photosSection}>
                    <Text style={styles.photosTitle}>{t('common.photos')}</Text>
                    {item.photos.length === 0 ? (
                      <Text style={styles.paragraphMuted}>
                        {t('trips.noPhotosForPoint')}
                      </Text>
                    ) : (
                      <ScrollView
                        horizontal
                        contentContainerStyle={styles.photosRow}
                        showsHorizontalScrollIndicator={false}
                      >
                        {item.photos.map((photo) => (
                          <View key={photo.id} style={styles.photoItem}>
                            <Pressable onPress={() => setPreviewPhotoUri(photo.filePath)}>
                              <Image source={{ uri: photo.filePath }} style={styles.photoThumb} />
                            </Pressable>
                            <IconButton
                              icon="delete"
                              size={18}
                              style={styles.photoDelete}
                              onPress={() => void handleDeletePhoto(item.id, photo)}
                            />
                          </View>
                        ))}
                      </ScrollView>
                    )}
                    <Button
                      mode="contained-tonal"
                      style={styles.addPhotoButton}
                      onPress={() => void handleAddPhoto(item)}
                    >
                      {t('common.addPhoto')}
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
      <Modal
        transparent
        visible={previewPhotoUri != null}
        animationType="fade"
        onRequestClose={() => setPreviewPhotoUri(null)}
      >
        <View style={styles.previewBackdrop}>
          <Pressable style={styles.previewBackdrop} onPress={() => setPreviewPhotoUri(null)}>
            {previewPhotoUri && (
              <Image
                source={{ uri: previewPhotoUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 24,
  },
  center: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
  },
  paragraph: {
    marginBottom: 12,
  },
  paragraphMuted: {
    marginBottom: 12,
    opacity: 0.7,
  },
  field: {
    marginBottom: 4,
  },
  chip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  placeCard: {
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderButtons: {
    flexDirection: 'row',
  },
  notesInput: {
    marginTop: 8,
    marginBottom: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  photosSection: {
    marginTop: 4,
  },
  photosTitle: {
    marginBottom: 4,
    fontWeight: '500',
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  photoItem: {
    position: 'relative',
  },
  photoThumb: {
    width: 96,
    height: 96,
    borderRadius: 8,
  },
  photoDelete: {
    position: 'absolute',
    top: -12,
    right: -12,
  },
  addPhotoButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '80%',
  },
});

