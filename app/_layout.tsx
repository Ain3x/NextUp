import { Slot } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';
import { QueueProvider } from '@/context/QueueContext';

function RootLayoutNav() {
  useProtectedRoute();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueueProvider>
          <Host>
            <RootLayoutNav />
          </Host>
        </QueueProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}