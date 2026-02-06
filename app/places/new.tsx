import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Appbar } from 'react-native-paper';
import { usePlaceRepository } from '../../lib/repository';
import { PlaceForm, type PlaceFormValues } from '../../components/PlaceForm';

export default function NewPlaceScreen() {
  const router = useRouter();
  const placeRepo = usePlaceRepository();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: PlaceFormValues) => {
    try {
      setSubmitting(true);
      const lat = values.lat ? Number(values.lat) : null;
      const lng = values.lng ? Number(values.lng) : null;
      const id = await placeRepo.create({
        name: values.name,
        description: values.description || null,
        visitlater: values.visitlater,
        liked: values.liked,
        lat: Number.isFinite(lat as number) ? (lat as number) : null,
        lng: Number.isFinite(lng as number) ? (lng as number) : null,
      });
      router.replace(`/places/${id}` as Href);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить место. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Новое место" />
      </Appbar.Header>
      <PlaceForm submitLabel="Сохранить место" submitting={submitting} onSubmit={handleSubmit} />
    </>
  );
}

