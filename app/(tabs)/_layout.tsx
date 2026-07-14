import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },

        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.primary,
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Queue',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'list' : 'list-outline'}
            size={size}
            color={color}
          />
        ),
      }} />
      <Tabs.Screen name="search" options={{
        title: 'Search',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'search' : 'search-outline'}
            size={size}
            color={color}
          />
        ),
      }} />
      <Tabs.Screen name="pick" options={{
        title: 'Pick',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'bulb' : 'bulb-outline'}
            size={size}
            color={color}
          />
        ),
      }} />
      <Tabs.Screen name="profile" options={{ 
        title: 'Profile',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'person' : 'person-outline'}
            size={size}
            color={color}
          />
        ),
        }} />
    </Tabs>
  );
}