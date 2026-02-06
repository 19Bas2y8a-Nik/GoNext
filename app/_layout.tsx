import { Stack } from 'expo-router';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import { SQLiteProvider } from 'expo-sqlite';
import { ImageBackground, StyleSheet } from 'react-native';
import { initDatabase, DATABASE_NAME } from '../lib/database';

export default function RootLayout() {
  return (
    <PaperProvider theme={DefaultTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
        <ImageBackground
          source={require('../assets/backgrounds/gonext-bg.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <Stack screenOptions={{ headerShown: false }} />
        </ImageBackground>
      </SQLiteProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
