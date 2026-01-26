import { Stack } from 'expo-router';
import { BingoGameProvider } from '../contexts/BingoGameContext';
import { AuthProvider } from '../contexts/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
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
          name="login"
          options={{
            title: 'Iniciar Sesión',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Registro',
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
    </AuthProvider>
  );
}
