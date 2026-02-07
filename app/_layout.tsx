import { Stack } from 'expo-router';
import {
  PaperProvider,
  DefaultTheme,
  MD3DarkTheme,
} from 'react-native-paper';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { DatabaseProvider } from '../providers/DatabaseProvider';
import { ThemeProvider, useThemeMode } from '../providers/ThemeProvider';

function AppContent() {
  const { isDark } = useThemeMode();
  const theme = isDark ? MD3DarkTheme : DefaultTheme;
  const content = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? theme.colors.background : 'transparent',
        },
      }}
    />
  );

  return (
    <PaperProvider theme={theme}>
      <DatabaseProvider>
        {isDark ? (
          <View style={styles.container}>{content}</View>
        ) : (
          <ImageBackground
            source={require('../assets/backgrounds/gonext-bg.png')}
            style={styles.background}
            resizeMode="cover"
          >
            {content}
          </ImageBackground>
        )}
      </DatabaseProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
});
