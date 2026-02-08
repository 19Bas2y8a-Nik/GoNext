import { useRouter } from 'expo-router';
import { Pressable, View, StyleSheet } from 'react-native';
import {
  Appbar,
  List,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import {
  useThemeMode,
  PRIMARY_COLORS,
} from '../providers/ThemeProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { themeMode, setThemeMode, primaryColor, setPrimaryColor } =
    useThemeMode();
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
            title="Основной цвет"
            description="Цвет кнопок, ссылок и акцентов интерфейса."
            left={(props) => <List.Icon {...props} icon="palette-outline" />}
          />
          <View style={styles.colorCircles}>
            {PRIMARY_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setPrimaryColor(color)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  primaryColor === color && {
                    borderColor: theme.colors.outline,
                    borderWidth: 3,
                  },
                ]}
              />
            ))}
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
  colorCircles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
