import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Appbar, List, Text } from 'react-native-paper';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Общие
        </Text>
        <List.Section>
          <List.Item
            title="Тема приложения"
            description="Используется системная тема. Переключатель светлой/тёмной темы будет добавлен позже."
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          />
          <List.Item
            title="Единицы расстояния"
            description="Километры (смена единиц будет реализована в следующей версии)."
            left={(props) => <List.Icon {...props} icon="ruler-square" />}
          />
        </List.Section>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          О приложении
        </Text>
        <List.Section>
          <List.Item
            title="GoNext — дневник туриста"
            description="Версия 1.0. Настройки будут расширены в будущих обновлениях."
            left={(props) => <List.Icon {...props} icon="information-outline" />}
          />
        </List.Section>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 4,
  },
});
