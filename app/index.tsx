import { useRouter, type Href } from 'expo-router';
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
  const today = formatDate(new Date());

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
        <Text variant="bodyMedium" style={styles.date}>{today}</Text>
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Дневник туриста
        </Text>
        <View style={styles.buttons}>
          <Button mode="contained" onPress={() => router.push('/places' as Href)} style={styles.button}>
            Места
          </Button>
          <Button mode="contained" onPress={() => router.push('/trips' as Href)} style={styles.button}>
            Поездки
          </Button>
          <Button mode="contained" onPress={() => router.push('/next-place' as Href)} style={styles.button}>
            Следующее место
          </Button>
          <Button mode="outlined" onPress={() => router.push('/settings' as Href)} style={styles.button}>
            Настройки
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
