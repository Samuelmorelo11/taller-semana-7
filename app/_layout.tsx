import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { db } from '@/db/client';
import migrations from '@/drizzle/migrations';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // La primera pestana que se abre al arrancar es GeoCam.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Ninguna pantalla se monta antes de que la base este migrada
  const { success: migrated, error: migrationError } = useMigrations(db, migrations);

  if (!loaded) {
    return null;
  }

  if (migrationError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0b1020' }}>
        <Text style={{ color: '#f8fafc' }}>
          Error al preparar la base de datos: {migrationError.message}
        </Text>
      </View>
    );
  }

  if (!migrated) {
    return <ActivityIndicator style={{ flex: 1, backgroundColor: '#0b1020' }} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="foto/[id]" options={{ title: 'Foto', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}