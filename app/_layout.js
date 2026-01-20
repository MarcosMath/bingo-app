import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Bingo',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="game"
        options={{
          title: 'Juego de Bingo',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
