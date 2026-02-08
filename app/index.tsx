import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const today = formatDate(new Date());

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={t('home.title')} />
        <Text variant="bodyMedium" style={styles.date}>{today}</Text>
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('home.subtitle')}
        </Text>
        <View style={styles.buttons}>
          <Button mode="contained" onPress={() => router.push('/places' as Href)} style={styles.button}>
            {t('common.places')}
          </Button>
          <Button mode="contained" onPress={() => router.push('/trips' as Href)} style={styles.button}>
            {t('common.trips')}
          </Button>
          <Button mode="contained" onPress={() => router.push('/next-place' as Href)} style={styles.button}>
            {t('common.nextPlace')}
          </Button>
          <Button mode="outlined" onPress={() => router.push('/settings' as Href)} style={styles.button}>
            {t('common.settings')}
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  date: {
    marginRight: 16,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
  },
  button: {
    minWidth: 200,
  },
});
