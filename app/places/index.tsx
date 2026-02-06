import { useEffect, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, FAB, List, Text, ActivityIndicator } from 'react-native-paper';
import type { Place } from '../../lib/types';
import { usePlaceRepository } from '../../lib/repository';

export default function PlacesScreen() {
  const router = useRouter();
  const placeRepo = usePlaceRepository();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await placeRepo.getAll();
        if (isMounted) {
          setPlaces(data);
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
  }, [placeRepo]);

  const goToNewPlace = () => {
    router.push('/places/new' as Href);
  };

  const openPlace = (id: number) => {
    router.push(`/places/${id}` as Href);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Места" />
      </Appbar.Header>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : places.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Пока нет ни одного места.</Text>
            <Text style={styles.emptyText}>Нажмите кнопку ниже, чтобы добавить первое место.</Text>
            <FAB style={styles.fabInline} icon="plus" label="Добавить место" onPress={goToNewPlace} />
          </View>
        ) : (
          <FlatList
            data={places}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.description ?? undefined}
                onPress={() => openPlace(item.id)}
                left={(props) => <List.Icon {...props} icon={item.liked ? 'heart' : 'map-marker'} />}
                right={(props) =>
                  item.visitlater ? <List.Icon {...props} icon="clock-outline" /> : undefined
                }
              />
            )}
          />
        )}
        <FAB style={styles.fab} icon="plus" onPress={goToNewPlace} />
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
