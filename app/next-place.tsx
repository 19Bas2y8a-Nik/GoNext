import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function NextPlaceScreen() {
  const router = useRouter();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="bodyMedium">Экран будет реализован на Этапе 4</Text>
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
