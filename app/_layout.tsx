import { Stack } from 'expo-router';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase, DATABASE_NAME } from '../lib/database';

export default function RootLayout() {
  return (
    <PaperProvider theme={DefaultTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
        <Stack screenOptions={{ headerShown: false }} />
      </SQLiteProvider>
    </PaperProvider>
  );
}
