import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function TripsScreen() {
  const router = useRouter();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="bodyMedium">Список поездок будет реализован на Этапе 3</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
