import { useEffect, useState } from 'react';
import { Alert, View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Appbar, Checkbox, List, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { TripForm, type TripFormValues } from '../../components/TripForm';
import type { Place } from '../../lib/types';
import { usePlaceRepository, useTripPlaceRepository, useTripRepository } from '../../lib/repository';

export default function NewTripScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const placeRepo = usePlaceRepository();
  const tripRepo = useTripRepository();
  const tripPlaceRepo = useTripPlaceRepository();

  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPlaces = async () => {
      try {
        const data = await placeRepo.getAll();
        if (isMounted) {
          setPlaces(data);
        }
      } finally {
        if (isMounted) {
          setLoadingPlaces(false);
        }
      }
    };
    void loadPlaces();
    return () => {
      isMounted = false;
    };
  }, [placeRepo]);

  const togglePlace = (id: number) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (values: TripFormValues) => {
    try {
      setSubmitting(true);
      const tripId = await tripRepo.create({
        title: values.title,
        description: values.description || null,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        current: values.current,
      });

      // Сохраняем выбранные места в trip_places по порядку
      for (let index = 0; index < selectedPlaceIds.length; index++) {
        const placeId = selectedPlaceIds[index]!;
        await tripPlaceRepo.create({
          tripId,
          placeId,
          order: index,
          visited: false,
        });
      }

      router.replace(`/trips/${tripId}`);
    } catch (e) {
      Alert.alert(t('errors.error'), t('errors.saveTripFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('trips.new')} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <TripForm submitLabel={t('trips.saveTrip')} submitting={submitting} onSubmit={handleSubmit} />

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('trips.tripPlaces')}
        </Text>
        {loadingPlaces ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : places.length === 0 ? (
          <Text style={styles.emptyText}>
            {t('trips.noPlacesHint')}
          </Text>
        ) : (
          <View>
            {places.map((place) => (
              <List.Item
                key={place.id}
                title={place.name}
                description={place.description ?? undefined}
                onPress={() => togglePlace(place.id)}
                left={() => (
                  <Checkbox
                    status={selectedPlaceIds.includes(place.id) ? 'checked' : 'unchecked'}
                    onPress={() => togglePlace(place.id)}
                  />
                )}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  divider: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    marginHorizontal: 24,
    marginBottom: 8,
  },
  center: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginHorizontal: 24,
  },
});

