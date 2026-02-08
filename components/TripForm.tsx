import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Switch, Text, TextInput } from 'react-native-paper';

export interface TripFormValues {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface TripFormProps {
  initialValues?: Partial<TripFormValues>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: TripFormValues) => void | Promise<void>;
}

export function TripForm({ initialValues, submitLabel, submitting, onSubmit }: TripFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '');
  const [current, setCurrent] = useState(initialValues?.current ?? false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    void onSubmit({
      title: title.trim(),
      description: description.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      current,
    });
  };

  return (
    <View style={styles.form}>
      <TextInput
        label={t('trips.tripTitle')}
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
        autoFocus
      />
      <TextInput
        label={t('common.description')}
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        mode="outlined"
        multiline
      />
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{t('trips.startDate')}</Text>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          style={styles.dateInput}
          mode="outlined"
          placeholder="2026-07-01"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{t('trips.endDate')}</Text>
        <TextInput
          value={endDate}
          onChangeText={setEndDate}
          style={styles.dateInput}
          mode="outlined"
          placeholder="2026-07-10"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{t('trips.makeCurrent')}</Text>
        <Switch value={current} onValueChange={setCurrent} />
      </View>
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submit}
        disabled={!title.trim() || submitting}
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
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
  },
  dateInput: {
    flex: 1,
  },
  submit: {
    marginTop: 8,
  },
});

