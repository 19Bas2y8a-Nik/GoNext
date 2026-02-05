import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
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
