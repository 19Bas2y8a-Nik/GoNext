import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Appbar, List, SegmentedButtons, Text } from 'react-native-paper';
import { useThemeMode } from '../providers/ThemeProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeMode();
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
            description="Светлая или тёмная тема. В тёмной теме фоновое изображение отключено."
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          />
          <View style={styles.themeSelector}>
            <SegmentedButtons
              value={themeMode}
              onValueChange={(v) => setThemeMode(v as 'light' | 'dark')}
              buttons={[
                { value: 'light', label: 'Светлая' },
                { value: 'dark', label: 'Тёмная' },
              ]}
            />
          </View>
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
  themeSelector: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
