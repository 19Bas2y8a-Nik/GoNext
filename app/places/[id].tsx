import { useEffect, useState } from 'react';
import { Alert, Linking, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Appbar, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import type { Place } from '../../lib/types';
import { usePlaceRepository } from '../../lib/repository';
import { PlaceForm, type PlaceFormValues } from '../../components/PlaceForm';

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const placeRepo = usePlaceRepository();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const placeId = Number(id);

  useEffect(() => {
    if (!Number.isFinite(placeId)) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const load = async () => {
      try {
        const data = await placeRepo.getById(placeId);
        if (isMounted) {
          setPlace(data);
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
  }, [placeId, placeRepo]);

  const handleDelete = () => {
    if (!place) return;
    Alert.alert('Удалить место', 'Вы уверены, что хотите удалить это место?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await placeRepo.delete(place.id);
            router.replace('/places' as Href);
          } catch {
            Alert.alert('Ошибка', 'Не удалось удалить место. Попробуйте ещё раз.');
          }
        },
      },
    ]);
  };

  const handleUpdate = async (values: PlaceFormValues) => {
    if (!place) return;
    try {
      setSubmitting(true);
      const lat = values.lat ? Number(values.lat) : null;
      const lng = values.lng ? Number(values.lng) : null;
      await placeRepo.update(place.id, {
        name: values.name,
        description: values.description || null,
        visitlater: values.visitlater,
        liked: values.liked,
        lat: Number.isFinite(lat as number) ? (lat as number) : null,
        lng: Number.isFinite(lng as number) ? (lng as number) : null,
      });
      const updated = await placeRepo.getById(place.id);
      setPlace(updated);
      setEditing(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const openInMaps = () => {
    if (!place || place.lat == null || place.lng == null) {
      Alert.alert('Нет координат', 'Для этого места не заданы координаты.');
      return;
    }
    const url = `https://maps.google.com/?q=${place.lat},${place.lng}`;
    void Linking.openURL(url);
  };

  const startEditing = () => {
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      );
    }

    if (!place) {
      return (
        <View style={styles.center}>
          <Text>Место не найдено.</Text>
        </View>
      );
    }

    if (editing) {
      return (
        <PlaceForm
          submitLabel="Сохранить изменения"
          submitting={submitting}
          initialValues={{
            name: place.name,
            description: place.description ?? '',
            visitlater: place.visitlater,
            liked: place.liked,
            lat: place.lat != null ? String(place.lat) : '',
            lng: place.lng != null ? String(place.lng) : '',
          }}
          onSubmit={handleUpdate}
        />
      );
    }

    return (
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title={place.name} />
          <Card.Content>
            {place.description ? (
              <Text style={styles.paragraph}>{place.description}</Text>
            ) : (
              <Text style={styles.paragraphMuted}>Описание не задано.</Text>
            )}
            <Text style={styles.field}>
              Статус:{' '}
              {place.visitlater ? 'Запланировано к посещению' : 'Посещено или без статуса'}
            </Text>
            <Text style={styles.field}>Избранное: {place.liked ? 'Да' : 'Нет'}</Text>
            <Text style={styles.field}>
              Координаты:{' '}
              {place.lat != null && place.lng != null
                ? `${place.lat.toFixed(6)}, ${place.lng.toFixed(6)}`
                : 'не заданы'}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Фотографии
          </Text>
          <Text style={styles.paragraphMuted}>
            Список фотографий и добавление фото будут реализованы на Этапе 6.
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button mode="contained" onPress={openInMaps} disabled={place.lat == null || place.lng == null}>
            Открыть на карте
          </Button>
          <Button mode="outlined" onPress={startEditing}>
            Редактировать
          </Button>
          <Button mode="text" textColor="red" onPress={handleDelete}>
            Удалить место
          </Button>
        </View>
      </View>
    );
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place?.name ?? 'Место'} />
        {editing && <Appbar.Action icon="close" onPress={stopEditing} />}
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
  section: {
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 4,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
});

