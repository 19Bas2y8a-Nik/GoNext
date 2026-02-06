import { Stack } from 'expo-router';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import { ImageBackground, StyleSheet } from 'react-native';
import { DatabaseProvider } from '../providers/DatabaseProvider';

export default function RootLayout() {
  return (
    <PaperProvider theme={DefaultTheme}>
      <DatabaseProvider>
        <ImageBackground
          source={require('../assets/backgrounds/gonext-bg.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </ImageBackground>
      </DatabaseProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
