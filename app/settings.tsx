import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="bodyMedium">Экран настроек будет реализован на Этапе 5</Text>
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
