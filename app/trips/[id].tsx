import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  List,
  Text,
  TextInput,
} from 'react-native-paper';
import type { Trip, TripPlace } from '../../lib/types';
import {
  usePlaceRepository,
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

function formatDate(date: string | null): string | null {
  return date || null;
}

function getTripStatusLabel(trip: Trip | null, places: TripPlaceWithPlace[]): string {
  if (!trip) return '';
  const now = new Date();
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : null;
  const anyVisited = places.some((p) => p.visited);
  const allVisited = places.length > 0 && places.every((p) => p.visited);

  if (!start && !end) {
    return anyVisited ? 'Дневник поездки' : 'План поездки';
  }

  if (end && now > end) {
    return allVisited ? 'Дневник поездки (завершена)' : 'Дневник поездки (есть непосещённые места)';
  }

  if (start && now < start) {
    return 'План поездки';
  }

  return anyVisited ? 'Дневник поездки' : 'План поездки';
}

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tripRepo = useTripRepository();
  const tripPlaceRepo = useTripPlaceRepository();
  const placeRepo = usePlaceRepository();

  const tripId = Number(id);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<TripPlaceWithPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
        // Убеждаемся, что for each place we have minimal data
        const withPlaces: TripPlaceWithPlace[] = [];
        for (const item of tp) {
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

  const statusLabel = useMemo(() => getTripStatusLabel(trip, places), [trip, places]);

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

  const toggleVisited = async (item: TripPlaceWithPlace) => {
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
      Alert.alert('Ошибка', 'Не удалось обновить статус места.');
    } finally {
      setUpdating(false);
    }
  };

  const updateNotes = async (item: TripPlaceWithPlace, notes: string) => {
    try {
      setUpdating(true);
      await tripPlaceRepo.updateNotes(item.id, notes || null);
      setPlaces((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, notes } : p)),
      );
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить заметки.');
    } finally {
      setUpdating(false);
    }
  };

  const openPlaceOnMap = (item: TripPlaceWithPlace) => {
    if (!item.place || item.place.lat == null || item.place.lng == null) {
      Alert.alert('Нет координат', 'Для этого места не заданы координаты.');
      return;
    }
    const url = `https://maps.google.com/?q=${item.place.lat},${item.place.lng}`;
    void Linking.openURL(url);
  };

  const openPlaceCard = (item: TripPlaceWithPlace) => {
    if (!item.place) return;
    router.push(`/places/${item.place.id}` as Href);
  };

  const deleteTrip = () => {
    if (!trip) return;
    Alert.alert('Удалить поездку', 'Вы уверены, что хотите удалить эту поездку?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await tripRepo.delete(trip.id);
            router.replace('/trips' as Href);
          } catch {
            Alert.alert('Ошибка', 'Не удалось удалить поездку.');
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
          <Appbar.Content title="Поездка" />
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
          <Appbar.Content title="Поездка" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>Поездка не найдена.</Text>
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
              <Text style={styles.paragraphMuted}>Описание не задано.</Text>
            )}
            <Text style={styles.field}>
              Даты: {formatDate(trip.startDate) || '—'} — {formatDate(trip.endDate) || '—'}
            </Text>
            <Text style={styles.field}>Текущая поездка: {trip.current ? 'Да' : 'Нет'}</Text>
            {statusLabel ? (
              <Chip style={styles.chip} compact>
                {statusLabel}
              </Chip>
            ) : null}
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Маршрут
          </Text>
          {places.length === 0 ? (
            <Text style={styles.paragraphMuted}>
              В эту поездку пока не добавлены места.
            </Text>
          ) : (
            places.map((item, index) => (
              <Card key={item.id} style={styles.placeCard}>
                <Card.Title
                  title={`${index + 1}. ${item.place?.name ?? 'Место удалено'}`}
                  subtitle={
                    item.place?.description
                      ? item.place.description
                      : 'Описание не задано.'
                  }
                />
                <Card.Content>
                  <View style={styles.rowBetween}>
                    <Chip
                      compact
                      icon={item.visited ? 'check-circle' : 'clock-outline'}
                      onPress={() => void toggleVisited(item)}
                    >
                      {item.visited ? 'Посещено' : 'Не посещено'}
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
                    Дата посещения:{' '}
                    {item.visitDate ? formatDate(item.visitDate) : 'не задана'}
                  </Text>
                  <TextInput
                    label="Заметки"
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
                      Открыть на карте
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => openPlaceCard(item)}
                      disabled={!item.place}
                    >
                      Карточка места
                    </Button>
                  </View>
                  <View style={styles.photosInfo}>
                    <Text style={styles.paragraphMuted}>
                      Фото для точек маршрута будут добавлены на Этапе 6 (фото и файловая
                      система).
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
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
  photosInfo: {
    marginTop: 4,
  },
});

