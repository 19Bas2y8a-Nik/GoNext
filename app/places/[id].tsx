import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  View,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Appbar, Button, Card, Text, ActivityIndicator, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import type { Place, Photo } from '../../lib/types';
import { usePlaceRepository, usePhotoRepository } from '../../lib/repository';
import { PlaceForm, type PlaceFormValues } from '../../components/PlaceForm';

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const placeRepo = usePlaceRepository();
  const photoRepo = usePhotoRepository();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

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

  useEffect(() => {
    let isMounted = true;
    const loadPhotos = async () => {
      try {
        const data = await photoRepo.getByPlaceId(placeId);
        if (isMounted) {
          setPhotos(data);
        }
      } finally {
        if (isMounted) {
          setPhotosLoading(false);
        }
      }
    };
    if (Number.isFinite(placeId)) {
      void loadPhotos();
    } else {
      setPhotosLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [placeId, photoRepo]);

  const handleDelete = () => {
    if (!place) return;
    Alert.alert('Удалить место', 'Вы уверены, что хотите удалить это место?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            // Удаляем файлы фотографий с диска
            const placePhotos = await photoRepo.getByPlaceId(place.id);
            for (const p of placePhotos) {
              if (p.filePath) {
                try {
                  // idempotent: true — не упадём, если файл уже удалён
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  await FileSystem.deleteAsync(p.filePath, { idempotent: true });
                } catch {
                  // игнорируем ошибки удаления отдельных файлов
                }
              }
              await photoRepo.delete(p.id);
            }
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

  const formatCoordinates = (lat: number | null, lng: number | null): string => {
    if (lat == null || lng == null) return 'не заданы';
    const latAbs = Math.abs(lat).toFixed(6);
    const lngAbs = Math.abs(lng).toFixed(6);
    const latHemisphere = lat >= 0 ? 'N' : 'S';
    const lngHemisphere = lng >= 0 ? 'E' : 'W';
    return `${latAbs}° ${latHemisphere}, ${lngAbs}° ${lngHemisphere}`;
  };

  const getPlacePhotosDir = (placeIdValue: number): string => {
    const base = FileSystem.documentDirectory ?? '';
    return `${base}places/${placeIdValue}/`;
  };

  const handleAddPhoto = async () => {
    if (!place) return;
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

      const dir = getPlacePhotosDir(place.id);
      try {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      } catch {
        // папка уже существует или не удалось создать — продолжим попытку записи файла
      }
      const ext = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const dest = `${dir}${fileName}`;
      await FileSystem.copyAsync({ from: asset.uri, to: dest });
      const newId = await photoRepo.create({
        placeId: place.id,
        filePath: dest,
      });
      const newPhoto: Photo = {
        id: newId,
        placeId: place.id,
        filePath: dest,
        createdAt: new Date().toISOString(),
      };
      setPhotos((prev) => [newPhoto, ...prev]);
    } catch {
      Alert.alert('Ошибка', 'Не удалось добавить фото. Попробуйте ещё раз.');
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    try {
      if (photo.filePath) {
        try {
          await FileSystem.deleteAsync(photo.filePath, { idempotent: true });
        } catch {
          // игнорируем
        }
      }
      await photoRepo.delete(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (previewPhoto?.id === photo.id) {
        setPreviewPhoto(null);
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось удалить фото.');
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
            <Text style={styles.field}>Координаты: {formatCoordinates(place.lat, place.lng)}</Text>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Фотографии
          </Text>
          {photosLoading ? (
            <View style={styles.photosRow}>
              <ActivityIndicator />
            </View>
          ) : photos.length === 0 ? (
            <Text style={styles.paragraphMuted}>
              Пока нет фотографий. Нажмите «Добавить фото», чтобы прикрепить первое изображение.
            </Text>
          ) : (
            <ScrollView horizontal contentContainerStyle={styles.photosRow} showsHorizontalScrollIndicator={false}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoItem}>
                  <Pressable onPress={() => setPreviewPhoto(photo)}>
                    <Image source={{ uri: photo.filePath }} style={styles.photoThumb} />
                  </Pressable>
                  <IconButton
                    icon="delete"
                    size={18}
                    style={styles.photoDelete}
                    onPress={() => void handleDeletePhoto(photo)}
                  />
                </View>
              ))}
            </ScrollView>
          )}
          <Button mode="contained-tonal" style={styles.addPhotoButton} onPress={handleAddPhoto}>
            Добавить фото
          </Button>
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
      <Modal
        transparent
        visible={!!previewPhoto}
        animationType="fade"
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <View style={styles.previewBackdrop}>
          <Pressable style={styles.previewBackdrop} onPress={() => setPreviewPhoto(null)}>
            {previewPhoto && (
              <Image
                source={{ uri: previewPhoto.filePath }}
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
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
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
  buttons: {
    width: '100%',
    gap: 12,
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

