import { Stack } from 'expo-router';
import { BingoGameProvider } from '../contexts/BingoGameContext';

export default function Layout() {
  return (
    <BingoGameProvider>
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
          title: 'Inicio',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="lobby"
        options={{
          title: 'Lobby',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="waiting"
        options={{
          title: 'Esperando Jugadores',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="game"
        options={{
          title: 'Jugando',
          headerShown: true,
        }}
      />
    </Stack>
    </BingoGameProvider>
  );
}
