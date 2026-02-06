import { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';
import * as Location from 'expo-location';

export interface PlaceFormValues {
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  lat: string;
  lng: string;
}

interface PlaceFormProps {
  initialValues?: Partial<PlaceFormValues>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: PlaceFormValues) => void | Promise<void>;
}

export function PlaceForm({ initialValues, submitLabel, submitting, onSubmit }: PlaceFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [visitlater, setVisitlater] = useState(initialValues?.visitlater ?? true);
  const [liked, setLiked] = useState(initialValues?.liked ?? false);
  const [lat, setLat] = useState(initialValues?.lat ?? '');
  const [lng, setLng] = useState(initialValues?.lng ?? '');
  const [locLoading, setLocLoading] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }
    void onSubmit({
      name: name.trim(),
      description: description.trim(),
      visitlater,
      liked,
      lat: lat.trim(),
      lng: lng.trim(),
    });
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Геолокация', 'Разрешение на доступ к геолокации не предоставлено.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setLat(String(position.coords.latitude));
      setLng(String(position.coords.longitude));
    } catch (e) {
      Alert.alert('Геолокация', 'Не удалось получить текущее местоположение.');
    } finally {
      setLocLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        label="Название"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
        autoFocus
      />
      <TextInput
        label="Описание"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        mode="outlined"
        multiline
      />
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Посетить позже</Text>
        <Switch value={visitlater} onValueChange={setVisitlater} />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Избранное</Text>
        <Switch value={liked} onValueChange={setLiked} />
      </View>
      <View style={styles.coordsRow}>
        <TextInput
          label="Широта (Decimal Degrees)"
          value={lat}
          onChangeText={setLat}
          style={[styles.input, styles.coordInput]}
          mode="outlined"
          keyboardType="numeric"
          placeholder="55.752220"
        />
        <TextInput
          label="Долгота (Decimal Degrees)"
          value={lng}
          onChangeText={setLng}
          style={[styles.input, styles.coordInput]}
          mode="outlined"
          keyboardType="numeric"
          placeholder="37.615560"
        />
      </View>
      <Button
        mode="text"
        onPress={handleUseCurrentLocation}
        disabled={locLoading}
        loading={locLoading}
      >
        Использовать текущее местоположение
      </Button>
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submit}
        disabled={!name.trim() || submitting}
        loading={submitting}
      >
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 24,
    gap: 16,
  },
  input: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 16,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordInput: {
    flex: 1,
  },
  submit: {
    marginTop: 8,
  },
});

