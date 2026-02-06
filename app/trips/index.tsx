import { useEffect, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, FAB, List, Text, ActivityIndicator, Chip } from 'react-native-paper';
import type { Trip } from '../../lib/types';
import { useTripRepository } from '../../lib/repository';

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return 'Даты не указаны';
  if (startDate && !endDate) return `с ${startDate}`;
  if (!startDate && endDate) return `до ${endDate}`;
  return `${startDate} — ${endDate}`;
}

export default function TripsScreen() {
  const router = useRouter();
  const tripRepo = useTripRepository();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await tripRepo.getAll();
        if (isMounted) {
          setTrips(data);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [tripRepo]);

  const goToNewTrip = () => {
    router.push('/trips/new' as Href);
  };

  const openTrip = (id: number) => {
    router.push(`/trips/${id}` as Href);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
      </Appbar.Header>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Пока нет ни одной поездки.</Text>
            <Text style={styles.emptyText}>Нажмите кнопку ниже, чтобы создать первую поездку.</Text>
            <FAB style={styles.fabInline} icon="plus" label="Создать поездку" onPress={goToNewTrip} />
          </View>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <List.Item
                title={item.title}
                description={formatDateRange(item.startDate, item.endDate)}
                onPress={() => openTrip(item.id)}
                left={(props) => <List.Icon {...props} icon="map" />}
                right={(props) =>
                  item.current ? <Chip {...props} compact>Текущая</Chip> : undefined
                }
              />
            )}
          />
        )}
        <FAB style={styles.fab} icon="plus" onPress={goToNewTrip} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fabInline: {
    marginTop: 16,
  },
});
