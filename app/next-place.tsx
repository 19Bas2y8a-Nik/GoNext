import { useEffect, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Appbar, Button, Card, Text } from 'react-native-paper';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import type { Trip, TripPlace } from '../lib/types';
import { useTripPlaceRepository, useTripRepository } from '../lib/repository';

type NextTripPlace = TripPlace & {
  place?: {
    id: number;
    name: string;
    description: string | null;
    lat: number | null;
    lng: number | null;
  };
};

export default function NextPlaceScreen() {
  const router = useRouter();
  const tripRepo = useTripRepository();
  const tripPlaceRepo = useTripPlaceRepository();

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [nextPlace, setNextPlace] = useState<NextTripPlace | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const currentTrip = await tripRepo.getCurrent();
        if (!isMounted) return;
        if (!currentTrip) {
          setTrip(null);
          setNextPlace(null);
          return;
        }
        setTrip(currentTrip);
        const tp = await tripPlaceRepo.getNextUnvisited(currentTrip.id);
        if (!isMounted) return;
        setNextPlace(
          tp
            ? {
                ...tp,
                place: tp.place
                  ? {
                      id: tp.place.id,
                      name: tp.place.name,
                      description: tp.place.description,
                      lat: tp.place.lat,
                      lng: tp.place.lng,
                    }
                  : undefined,
              }
            : null,
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [tripRepo, tripPlaceRepo]);

  const formatCoordinates = (lat: number | null, lng: number | null): string => {
    if (lat == null || lng == null) return 'не заданы';
    const latAbs = Math.abs(lat).toFixed(6);
    const lngAbs = Math.abs(lng).toFixed(6);
    const latHemisphere = lat >= 0 ? 'N' : 'S';
    const lngHemisphere = lng >= 0 ? 'E' : 'W';
    return `${latAbs}° ${latHemisphere}, ${lngAbs}° ${lngHemisphere}`;
  };

  const openInMaps = () => {
    if (!nextPlace?.place || nextPlace.place.lat == null || nextPlace.place.lng == null) {
      return;
    }
    const { lat, lng } = nextPlace.place;
    const url = `https://maps.google.com/?q=${lat},${lng}`;
    void Linking.openURL(url);
  };

  const openInNavigator = () => {
    if (!nextPlace?.place || nextPlace.place.lat == null || nextPlace.place.lng == null) {
      return;
    }
    const { lat, lng } = nextPlace.place;
    let url: string;
    if (Platform.OS === 'android') {
      url = `google.navigation:q=${lat},${lng}`;
    } else {
      // iOS и остальные платформы — Apple Maps / универсальная ссылка
      url = `http://maps.apple.com/?daddr=${lat},${lng}`;
    }
    void Linking.openURL(url);
  };

  const goToTrips = () => {
    router.push('/trips' as Href);
  };

  const goToTripDetails = () => {
    if (!trip) return;
    router.push(`/trips/${trip.id}` as Href);
  };

  const goToPlaceDetails = () => {
    if (!nextPlace?.place) return;
    router.push(`/places/${nextPlace.place.id}` as Href);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      );
    }

    if (!trip) {
      return (
        <View style={styles.center}>
          <Text style={styles.message}>
            Нет активной поездки. Отметьте одну из поездок как текущую, чтобы увидеть следующее
            место.
          </Text>
          <Button mode="contained" onPress={goToTrips}>
            Перейти к списку поездок
          </Button>
        </View>
      );
    }

    if (!nextPlace || !nextPlace.place) {
      return (
        <View style={styles.center}>
          <Text style={styles.message}>
            Для активной поездки «{trip.title}» нет следующего места.
          </Text>
          <Text style={styles.messageSecondary}>
            Либо все места уже посещены, либо в поездку ещё не добавлены места.
          </Text>
          <Button mode="contained" onPress={goToTripDetails}>
            Открыть поездку
          </Button>
        </View>
      );
    }

    const { place } = nextPlace;

    return (
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title={place.name} subtitle={trip.title} />
          <Card.Content>
            {place.description ? (
              <Text style={styles.paragraph}>{place.description}</Text>
            ) : (
              <Text style={styles.paragraphMuted}>Описание не задано.</Text>
            )}
            <Text style={styles.field}>
              Координаты: {formatCoordinates(place.lat, place.lng)}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttons}>
          <Button
            mode="contained"
            onPress={openInMaps}
            disabled={place.lat == null || place.lng == null}
          >
            Открыть на карте
          </Button>
          <Button
            mode="contained-tonal"
            onPress={openInNavigator}
            disabled={place.lat == null || place.lng == null}
          >
            Открыть в навигаторе
          </Button>
          <Button mode="outlined" onPress={goToPlaceDetails}>
            Карточка места
          </Button>
          <Button mode="text" onPress={goToTripDetails}>
            Открыть поездку
          </Button>
        </View>
      </View>
    );
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>
      {renderContent()}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
  },
  messageSecondary: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
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
  buttons: {
    gap: 12,
  },
});
