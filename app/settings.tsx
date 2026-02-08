import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { themeMode, setThemeMode, primaryColor, setPrimaryColor } =
    useThemeMode();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('settings.title')} />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('settings.general')}
        </Text>
        <List.Section>
          <List.Item
            title={t('settings.theme')}
            description={t('settings.themeDescription')}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          />
          <View style={styles.themeSelector}>
            <SegmentedButtons
              value={themeMode}
              onValueChange={(v) => setThemeMode(v as 'light' | 'dark')}
              buttons={[
                { value: 'light', label: t('settings.themeLight') },
                { value: 'dark', label: t('settings.themeDark') },
              ]}
            />
          </View>
          <List.Item
            title={t('settings.primaryColor')}
            description={t('settings.primaryColorDescription')}
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
            title={t('settings.language')}
            description={t('settings.languageDescription')}
            left={(props) => <List.Icon {...props} icon="translate" />}
          />
          <View style={styles.themeSelector}>
            <SegmentedButtons
              value={i18n.language}
              onValueChange={(v) => void i18n.changeLanguage(v)}
              buttons={[
                { value: 'ru', label: 'Русский' },
                { value: 'en', label: 'English' },
              ]}
            />
          </View>
          <List.Item
            title={t('settings.distanceUnits')}
            description={t('settings.distanceUnitsDescription')}
            left={(props) => <List.Icon {...props} icon="ruler-square" />}
          />
        </List.Section>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('settings.about')}
        </Text>
        <List.Section>
          <List.Item
            title={t('settings.appName')}
            description={t('settings.appDescription')}
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
