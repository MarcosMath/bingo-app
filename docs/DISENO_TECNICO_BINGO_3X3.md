# Diseño Técnico - Bingo Rápido 3x3 con Premios Escalonados

**Versión**: 1.0
**Fecha**: 2026-01-25
**Estado**: Diseño Aprobado - Pendiente Implementación

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelo de Datos](#modelo-de-datos)
4. [Backend - Servicios](#backend---servicios)
5. [Backend - Endpoints API](#backend---endpoints-api)
6. [Frontend - Componentes](#frontend---componentes)
7. [Flujo de Juego Completo](#flujo-de-juego-completo)
8. [Sistema de Premios Escalonados](#sistema-de-premios-escalonados)
9. [Sistema de Misiones Diarias](#sistema-de-misiones-diarias)
10. [Casos de Uso](#casos-de-uso)
11. [Plan de Implementación](#plan-de-implementación)

---

## Resumen Ejecutivo

### Objetivo
Implementar el sistema completo de **Bingo Rápido 3x3** con premios escalonados y misiones diarias para aumentar engagement y retención de usuarios.

### Características Clave
- Partidas rápidas (2-3 minutos)
- 2-4 jugadores por sala
- 3 niveles de salas (10, 50, 100 créditos)
- Premios escalonados (60%, 30%, 10%)
- House edge del 20%
- Misiones diarias con recompensas BONUS

### Métricas de Éxito
- Tiempo promedio de partida: 2-3 minutos
- Tasa de finalización: >90%
- Usuarios completan misiones diarias: >50%
- Engagement diario: 3+ partidas por usuario

---

## Arquitectura del Sistema

### Stack Tecnológico

```
Frontend (Mobile):
├── React Native + Expo
├── Expo Router (navegación)
├── WebSocket (real-time)
└── AsyncStorage (persistencia)

Backend:
├── NestJS + TypeScript
├── Prisma ORM
├── PostgreSQL
├── WebSocket Gateway
└── Cron Jobs (misiones diarias)

Infraestructura:
├── Supabase (PostgreSQL)
└── Backend en producción (puerto 3000)
```

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND MOBILE                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Selector de  │  │   Lobby de   │  │  Pantalla de │      │
│  │    Salas     │→ │    Espera    │→ │  Juego 3x3   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Misiones    │  │  Historial   │                         │
│  │   Diarias    │  │  de Juegos   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket + REST API
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND NESTJS                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Games      │  │   Missions   │  │ Transactions │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Games      │  │  WebSocket   │                         │
│  │  Controller  │  │   Gateway    │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            ↕
                    ┌───────────────┐
                    │  PostgreSQL   │
                    │   (Supabase)  │
                    └───────────────┘
```

---

## Modelo de Datos

### Relaciones Clave

```prisma
Game (1) ──> (N) GameParticipant
Game (1) ──> (N) BingoCard
User (1) ──> (N) GameParticipant
User (1) ──> (N) Transaction
User (1) ──> (N) UserDailyMission
DailyMission (1) ──> (N) UserDailyMission
```

### Estados del Juego

```typescript
enum GameStatus {
  WAITING,    // Esperando jugadores
  PLAYING,    // En curso
  FINISHED,   // Terminado (hay ganador)
  CANCELLED   // Cancelado
}
```

### Tamaños de Cartón

```typescript
enum CardSize {
  RAPID_3X3,      // 3x3 - Números 1-27
  CLASSIC_5X5     // 5x5 - Números 1-75
}
```

### Posiciones de Premio

```
GameParticipant.position:
- 1: Primer lugar (60% del prize pool)
- 2: Segundo lugar (30% del prize pool)
- 3: Tercer lugar (10% del prize pool)
- null: Sin premio
```

---

## Backend - Servicios

### 1. GamesService (Actualizado)

#### Método: createGame()

**Firma Actual**:
```typescript
async createGame(
  userId: string,
  maxPlayers: number = 4,
  betAmount: number,
  isPrivate: boolean = false,
)
```

**Nueva Firma**:
```typescript
async createGame(
  userId: string,
  cardSize: CardSize,
  betAmount: number,
  maxPlayers: number = 4,
  isPrivate: boolean = false,
)
```

**Cambios**:
```typescript
async createGame(
  userId: string,
  cardSize: CardSize,
  betAmount: number,
  maxPlayers: number = 4,
  isPrivate: boolean = false,
) {
  // Validar créditos
  const hasCredits = await this.usersService.hasCredits(userId, betAmount);
  if (!hasCredits) {
    throw new BadRequestException('Insufficient credits');
  }

  // Calcular house edge y prize pool inicial
  const houseEdge = 20; // 20%
  const houseCut = betAmount * (houseEdge / 100);
  const netBetAmount = betAmount - houseCut;

  // Crear juego
  const game = await this.prisma.game.create({
    data: {
      mode: GameMode.MULTIPLAYER,
      cardSize,
      betAmount,
      prizePool: 0, // Se incrementa cuando jugadores se unan
      houseEdge,
      maxPlayers,
      hostId: userId,
      currentPlayers: 0,
      isPrivate,
    },
  });

  return this.findOne(game.id);
}
```

#### Método: joinGame() (Actualizado)

**Cambios**:
```typescript
async joinGame(gameId: string, userId: string, betAmount: number) {
  const game = await this.findOne(gameId);

  // Validaciones existentes...

  // Deducir créditos
  await this.usersService.deductCredits(userId, betAmount);

  // Calcular contribución neta al pool (después de house edge)
  const houseEdge = Number(game.houseEdge);
  const houseCut = betAmount * (houseEdge / 100);
  const netContribution = betAmount - houseCut;

  // Actualizar prize pool
  await this.prisma.game.update({
    where: { id: gameId },
    data: {
      prizePool: { increment: netContribution },
      currentPlayers: { increment: 1 },
    },
  });

  // Crear registro de participante
  await this.prisma.gameParticipant.create({
    data: {
      gameId,
      userId,
      position: null, // Se asigna cuando termine el juego
      prize: 0,
    },
  });

  // Crear cartón según cardSize
  const cardSize = game.cardSize === 'RAPID_3X3' ? '3x3' : '5x5';
  const card = await this.createCardForPlayer(gameId, userId, cardSize);

  return { game: await this.findOne(gameId), card };
}
```

#### Método: createCardForPlayer() (Actualizado)

**Cambios**:
```typescript
private async createCardForPlayer(
  gameId: string,
  userId: string,
  cardSize: '3x3' | '5x5' = '5x5',
) {
  const numbers = BingoCardGenerator.generateCard(cardSize);

  return await this.prisma.bingoCard.create({
    data: {
      gameId,
      userId,
      numbers,
      markedNumbers: [],
      markedCount: 0,
    },
  });
}
```

#### Método: drawNumber() (Actualizado)

**Cambios**:
```typescript
async drawNumber(gameId: string): Promise<number | null> {
  const game = await this.findOne(gameId);

  if (game.status !== GameStatus.PLAYING) {
    throw new BadRequestException('Game is not playing');
  }

  // Límite de números según cardSize
  const maxNumber = game.cardSize === 'RAPID_3X3' ? 27 : 75;

  if (game.drawnNumbers.length >= maxNumber) {
    // Terminar juego sin ganador
    await this.finishGameWithoutWinner(gameId);
    return null;
  }

  // Generar número aleatorio
  let number: number;
  do {
    number = Math.floor(Math.random() * maxNumber) + 1;
  } while (game.drawnNumbers.includes(number));

  const drawnNumbers = [...game.drawnNumbers, number];

  await this.prisma.game.update({
    where: { id: gameId },
    data: { drawnNumbers, currentNumber: number },
  });

  return number;
}
```

#### Método: claimBingo() (Actualizado con Premios Escalonados)

**Nueva Implementación**:
```typescript
async claimBingo(cardId: string, userId: string) {
  const card = await this.prisma.bingoCard.findFirst({
    where: { id: cardId, userId },
    include: { game: true },
  });

  if (!card) {
    throw new NotFoundException('Card not found');
  }

  if (card.game.status !== GameStatus.PLAYING) {
    throw new BadRequestException('Game is not playing');
  }

  // Verificar bingo válido
  const hasBingo = BingoCardGenerator.checkBingo(
    card.numbers as number[][],
    card.markedNumbers,
  );

  if (!hasBingo) {
    return { isValid: false, message: 'No tienes Bingo' };
  }

  // Marcar cartón como ganador
  await this.prisma.bingoCard.update({
    where: { id: cardId },
    data: { hasWon: true },
  });

  // Obtener posición actual (cuántos ya ganaron)
  const winnersCount = await this.prisma.gameParticipant.count({
    where: {
      gameId: card.game.id,
      position: { not: null },
    },
  });

  const position = winnersCount + 1;

  // Si es el 3er ganador o más, terminar el juego
  if (position >= 3) {
    await this.finishGameWithPrizes(card.game.id);
  } else {
    // Actualizar posición del participante
    await this.updateParticipantPosition(card.game.id, userId, position);
  }

  // Calcular premio
  const prize = await this.calculatePrize(card.game.id, position);

  return {
    isValid: true,
    position,
    prize,
    gameId: card.game.id,
  };
}
```

#### Nuevo Método: finishGameWithPrizes()

```typescript
private async finishGameWithPrizes(gameId: string): Promise<void> {
  const game = await this.findOne(gameId);

  if (game.status === GameStatus.FINISHED) {
    return; // Ya terminó
  }

  // Obtener participantes ordenados por posición
  const participants = await this.prisma.gameParticipant.findMany({
    where: { gameId },
    orderBy: { position: 'asc' },
  });

  const prizePool = Number(game.prizePool);

  // Distribución de premios
  const prizes = {
    1: prizePool * 0.60, // 60%
    2: prizePool * 0.30, // 30%
    3: prizePool * 0.10, // 10%
  };

  // Actualizar premios y acreditar a usuarios
  for (const participant of participants) {
    if (participant.position && participant.position <= 3) {
      const prize = prizes[participant.position];

      // Actualizar GameParticipant
      await this.prisma.gameParticipant.update({
        where: { id: participant.id },
        data: { prize },
      });

      // Acreditar créditos al usuario (CASH porque ganó)
      await this.usersService.addCredits(participant.userId, prize, 'CASH');

      // Crear transacción
      await this.createTransaction(
        participant.userId,
        'GAME_WIN',
        'CASH',
        prize,
        gameId,
      );
    }
  }

  // Marcar primer lugar como ganador oficial
  const winner = participants.find(p => p.position === 1);

  await this.prisma.game.update({
    where: { id: gameId },
    data: {
      status: GameStatus.FINISHED,
      winnerId: winner?.userId,
      finishedAt: new Date(),
    },
  });
}
```

#### Nuevo Método: createTransaction()

```typescript
private async createTransaction(
  userId: string,
  type: TransactionType,
  creditType: CreditType,
  amount: number,
  referenceId: string,
): Promise<void> {
  const user = await this.usersService.findOne(userId);

  const balanceBefore = creditType === 'CASH'
    ? Number(user.creditsCash)
    : Number(user.creditsBonus);

  const balanceAfter = balanceBefore + amount;

  await this.prisma.transaction.create({
    data: {
      userId,
      type,
      creditType,
      amount,
      balanceBefore,
      balanceAfter,
      description: `${type} - Game ${referenceId.substring(0, 8)}`,
      referenceId,
      referenceType: 'game',
    },
  });
}
```

#### Nuevo Método: updateParticipantPosition()

```typescript
private async updateParticipantPosition(
  gameId: string,
  userId: string,
  position: number,
): Promise<void> {
  await this.prisma.gameParticipant.updateMany({
    where: { gameId, userId },
    data: { position },
  });
}
```

#### Nuevo Método: calculatePrize()

```typescript
private async calculatePrize(
  gameId: string,
  position: number,
): Promise<number> {
  const game = await this.findOne(gameId);
  const prizePool = Number(game.prizePool);

  const percentages = { 1: 0.60, 2: 0.30, 3: 0.10 };
  return prizePool * (percentages[position] || 0);
}
```

### 2. MissionsService (Nuevo)

**Ubicación**: `apps/backend/src/missions/missions.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Obtener misiones diarias de un usuario
   */
  async getUserMissions(userId: string) {
    // Obtener todas las misiones activas
    const missions = await this.prisma.dailyMission.findMany({
      where: { isActive: true },
    });

    // Obtener progreso del usuario
    const userMissions = await this.prisma.userDailyMission.findMany({
      where: { userId },
      include: { mission: true },
    });

    // Crear progreso para misiones que no tiene el usuario
    const userMissionIds = userMissions.map(um => um.missionId);
    const missingMissions = missions.filter(m => !userMissionIds.includes(m.id));

    for (const mission of missingMissions) {
      await this.prisma.userDailyMission.create({
        data: {
          userId,
          missionId: mission.id,
          currentCount: 0,
          isCompleted: false,
          lastResetAt: new Date(),
        },
      });
    }

    // Retornar misiones con progreso
    return await this.prisma.userDailyMission.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { mission: { createdAt: 'asc' } },
    });
  }

  /**
   * Incrementar progreso de una misión
   */
  async incrementProgress(
    userId: string,
    missionKey: string,
  ): Promise<boolean> {
    const mission = await this.prisma.dailyMission.findUnique({
      where: { key: missionKey },
    });

    if (!mission) {
      return false;
    }

    const userMission = await this.prisma.userDailyMission.findUnique({
      where: {
        userId_missionId: { userId, missionId: mission.id },
      },
    });

    if (!userMission || userMission.isCompleted) {
      return false;
    }

    const newCount = userMission.currentCount + 1;
    const isCompleted = newCount >= mission.targetCount;

    await this.prisma.userDailyMission.update({
      where: { id: userMission.id },
      data: {
        currentCount: newCount,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Auto-reclamar recompensa si se completó
    if (isCompleted) {
      await this.claimReward(userId, mission.id);
    }

    return isCompleted;
  }

  /**
   * Reclamar recompensa de misión
   */
  async claimReward(userId: string, missionId: string): Promise<number> {
    const userMission = await this.prisma.userDailyMission.findUnique({
      where: {
        userId_missionId: { userId, missionId },
      },
      include: { mission: true },
    });

    if (!userMission || !userMission.isCompleted) {
      throw new BadRequestException('Mission not completed');
    }

    const mission = userMission.mission;
    const rewardAmount = Number(mission.rewardAmount);
    const rewardType = mission.rewardType as 'CASH' | 'BONUS';

    // Acreditar recompensa
    await this.usersService.addCredits(userId, rewardAmount, rewardType);

    // Crear transacción
    await this.prisma.transaction.create({
      data: {
        userId,
        type: 'MISSION_REWARD',
        creditType: rewardType,
        amount: rewardAmount,
        balanceBefore: 0, // Calcular real
        balanceAfter: 0,  // Calcular real
        description: `Misión: ${mission.name}`,
        referenceId: missionId,
        referenceType: 'mission',
      },
    });

    return rewardAmount;
  }

  /**
   * Reset diario de misiones (Cron job a las 00:00)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyMissions() {
    console.log('Resetting daily missions...');

    await this.prisma.userDailyMission.updateMany({
      where: {},
      data: {
        currentCount: 0,
        isCompleted: false,
        completedAt: null,
        lastResetAt: new Date(),
      },
    });

    console.log('Daily missions reset complete');
  }
}
```

---

## Backend - Endpoints API

### GamesController (Nuevos Endpoints)

```typescript
// apps/backend/src/games/games.controller.ts

/**
 * Obtener salas disponibles por nivel
 */
@Get('rooms/:level')
async getRoomsByLevel(
  @Param('level') level: 'beginner' | 'intermediate' | 'advanced',
) {
  const betAmounts = {
    beginner: 10,
    intermediate: 50,
    advanced: 100,
  };

  return await this.gamesService.getAvailableRooms(
    betAmounts[level],
    CardSize.RAPID_3X3,
  );
}

/**
 * Crear sala de juego rápida 3x3
 */
@Post('create-rapid')
@UseGuards(JwtAuthGuard)
async createRapidGame(
  @Request() req,
  @Body() createDto: CreateRapidGameDto,
) {
  return await this.gamesService.createGame(
    req.user.id,
    CardSize.RAPID_3X3,
    createDto.betAmount,
    createDto.maxPlayers || 4,
    createDto.isPrivate || false,
  );
}
```

### MissionsController (Nuevo)

```typescript
// apps/backend/src/missions/missions.controller.ts

import { Controller, Get, Post, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { MissionsService } from './missions.service';

@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  /**
   * GET /api/missions/daily
   * Obtener misiones diarias del usuario
   */
  @Get('daily')
  async getDailyMissions(@Request() req) {
    return await this.missionsService.getUserMissions(req.user.id);
  }

  /**
   * POST /api/missions/:id/claim
   * Reclamar recompensa de misión
   */
  @Post(':id/claim')
  async claimMission(@Request() req, @Param('id') missionId: string) {
    const reward = await this.missionsService.claimReward(req.user.id, missionId);
    return { message: 'Recompensa reclamada', reward };
  }
}
```

### DTOs Necesarios

```typescript
// apps/backend/src/games/dto/create-rapid-game.dto.ts

import { IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateRapidGameDto {
  @IsNumber()
  @Min(10)
  @Max(100)
  betAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(4)
  maxPlayers?: number;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
```

---

## Frontend - Componentes

### 1. Selector de Salas

**Ubicación**: `apps/mobile/app/rooms.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function RoomsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const rooms = [
    {
      level: 'beginner',
      title: '🌱 Principiante',
      betAmount: 10,
      description: 'Perfecto para empezar',
      color: '#4CAF50',
    },
    {
      level: 'intermediate',
      title: '⚡ Intermedio',
      betAmount: 50,
      description: 'Para jugadores experimentados',
      color: '#FF9800',
    },
    {
      level: 'advanced',
      title: '🔥 Avanzado',
      betAmount: 100,
      description: 'Altas apuestas, grandes premios',
      color: '#F44336',
    },
  ];

  const handleRoomSelect = (level, betAmount) => {
    if (user.creditsTotal < betAmount) {
      Alert.alert('Créditos Insuficientes',
        `Necesitas ${betAmount} créditos para entrar a esta sala.`);
      return;
    }

    router.push({
      pathname: '/lobby',
      params: { level, betAmount },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tu Sala</Text>
      <Text style={styles.subtitle}>Bingo Rápido 3x3</Text>

      {rooms.map((room) => (
        <TouchableOpacity
          key={room.level}
          style={[styles.roomCard, { borderColor: room.color }]}
          onPress={() => handleRoomSelect(room.level, room.betAmount)}
        >
          <Text style={styles.roomTitle}>{room.title}</Text>
          <Text style={styles.roomDescription}>{room.description}</Text>
          <View style={styles.roomInfo}>
            <Text style={styles.betAmount}>💰 {room.betAmount} créditos</Text>
            <Text style={styles.players}>👥 2-4 jugadores</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.creditsInfo}>
        <Text style={styles.creditsLabel}>Tus Créditos:</Text>
        <Text style={styles.creditsValue}>{user?.creditsTotal || 0}</Text>
      </View>
    </View>
  );
}
```

### 2. Pantalla de Misiones

**Ubicación**: `apps/mobile/app/missions.js`

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api.service';

export default function MissionsScreen() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const data = await apiService.get('/missions/daily');
      setMissions(data);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (missionId) => {
    try {
      await apiService.post(`/missions/${missionId}/claim`);
      Alert.alert('¡Recompensa Reclamada!', 'Créditos agregados a tu cuenta');
      loadMissions();
    } catch (error) {
      Alert.alert('Error', error.userMessage || 'No se pudo reclamar');
    }
  };

  const renderMission = ({ item }) => {
    const progress = item.currentCount / item.mission.targetCount;
    const percentage = Math.min(progress * 100, 100);

    return (
      <View style={styles.missionCard}>
        <Text style={styles.missionName}>{item.mission.name}</Text>
        <Text style={styles.missionDescription}>{item.mission.description}</Text>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {item.currentCount}/{item.mission.targetCount}
          </Text>
        </View>

        {/* Recompensa */}
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>Recompensa:</Text>
          <Text style={styles.rewardAmount}>
            +{item.mission.rewardAmount} {item.mission.rewardType}
          </Text>
        </View>

        {/* Botón reclamar */}
        {item.isCompleted && (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => claimReward(item.mission.id)}
          >
            <Text style={styles.claimButtonText}>Reclamar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Misiones Diarias</Text>
      <Text style={styles.subtitle}>Se resetean a las 00:00</Text>

      <FlatList
        data={missions}
        renderItem={renderMission}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
```

### 3. UI de Juego 3x3

**Ubicación**: `apps/mobile/app/game3x3.js`

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Game3x3Screen() {
  const params = useLocalSearchParams();
  const [card, setCard] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);

  // Cartón 3x3 es más compacto que 5x5
  const renderCell = (number, rowIndex, colIndex) => {
    const isMarked = markedNumbers.includes(number);
    const isCurrent = number === currentNumber;

    return (
      <TouchableOpacity
        key={`${rowIndex}-${colIndex}`}
        style={[
          styles.cell,
          isMarked && styles.cellMarked,
          isCurrent && styles.cellCurrent,
        ]}
        onPress={() => handleCellPress(number)}
      >
        <Text style={[
          styles.cellNumber,
          isMarked && styles.cellNumberMarked,
        ]}>
          {number}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Número actual */}
      <View style={styles.currentNumberContainer}>
        <Text style={styles.currentNumberLabel}>Número Actual:</Text>
        <Text style={styles.currentNumber}>{currentNumber || '-'}</Text>
      </View>

      {/* Cartón 3x3 */}
      <View style={styles.cardContainer}>
        {card.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((number, colIndex) =>
              renderCell(number, rowIndex, colIndex)
            )}
          </View>
        ))}
      </View>

      {/* Botón Bingo */}
      <TouchableOpacity
        style={styles.bingoButton}
        onPress={handleBingoClaim}
      >
        <Text style={styles.bingoButtonText}>¡BINGO!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    backgroundColor: '#16213e',
    padding: 10,
    borderRadius: 15,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 80,
    height: 80,
    margin: 5,
    backgroundColor: '#0f3460',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },
  cellMarked: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  cellCurrent: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  cellNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cellNumberMarked: {
    color: '#fff',
  },
  currentNumberContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  currentNumberLabel: {
    fontSize: 18,
    color: '#a0a0a0',
    marginBottom: 10,
  },
  currentNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bingoButton: {
    marginTop: 30,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 50,
  },
  bingoButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
```

---

## Flujo de Juego Completo

### Diagrama de Secuencia

```
Usuario 1          Usuario 2          Backend              WebSocket
   |                  |                  |                     |
   |-- Crea Sala ---->|                  |                     |
   |                  |                  |-- Sala Creada ----->|
   |                  |                  |                     |
   |                  |-- Se Une ------->|                     |
   |<-----------------|- Notificación ----|<---- Broadcast -----|
   |                  |                  |                     |
   |-- Inicia Juego ->|                  |                     |
   |                  |                  |-- Status: PLAYING ->|
   |<----- Número 1 ---------------------|<--------------------|
   |                  |<-----------------|                     |
   |                  |                  |                     |
   |-- Marca 15 ----->|                  |                     |
   |                  |-- Marca 7 ------>|                     |
   |                  |                  |                     |
   |-- Bingo! ------->|                  |                     |
   |                  |                  |-- Valida Bingo ---->|
   |<-- 1er Lugar ----|                  |                     |
   |  (60% pool)      |                  |                     |
   |                  |                  |                     |
   |                  |-- Bingo! ------->|                     |
   |                  |                  |-- Valida Bingo ---->|
   |                  |<-- 2do Lugar ----|                     |
   |                  |   (30% pool)     |                     |
   |                  |                  |                     |
   |<--------- Fin del Juego ------------|<--------------------|
   |                  |<-----------------|                     |
```

### Estados del Juego

```
1. WAITING
   - Jugadores pueden unirse
   - Host puede iniciar o cancelar
   - Muestra jugadores actuales/máximo

2. PLAYING
   - Números se sortean automáticamente
   - Jugadores marcan sus cartones
   - Pueden reclamar Bingo

3. FINISHED
   - Premios distribuidos
   - Muestra ganadores (1°, 2°, 3°)
   - Opción de jugar otra vez
```

---

## Sistema de Premios Escalonados

### Distribución del Prize Pool

```
Ejemplo con 4 jugadores, apuesta de 50 créditos c/u:

Total apostado: 200 créditos
House edge (20%): 40 créditos
Prize Pool neto: 160 créditos

Distribución:
- 1er lugar: 96 créditos (60% de 160)
- 2do lugar: 48 créditos (30% de 160)
- 3er lugar: 16 créditos (10% de 160)
- 4to lugar: 0 créditos

Casa gana: 40 créditos (20% del total)
```

### Cálculo Dinámico

```typescript
// Función helper
function calculatePrizes(totalBets: number, houseEdge: number = 20) {
  const houseCut = totalBets * (houseEdge / 100);
  const prizePool = totalBets - houseCut;

  return {
    first: prizePool * 0.60,
    second: prizePool * 0.30,
    third: prizePool * 0.10,
    house: houseCut,
    total: totalBets,
  };
}
```

### Tracking de Posiciones

```typescript
// En claimBingo(), al validar un bingo:

// 1. Obtener cuántos ya ganaron
const winnersCount = await prisma.gameParticipant.count({
  where: {
    gameId: game.id,
    position: { not: null },
  },
});

// 2. Asignar siguiente posición
const position = winnersCount + 1;

// 3. Si es el 3er ganador, terminar el juego
if (position >= 3) {
  await finishGameWithPrizes(gameId);
}
```

---

## Sistema de Misiones Diarias

### Misiones Implementadas

```javascript
const DAILY_MISSIONS = [
  {
    key: 'login_daily',
    name: 'Login Diario',
    description: 'Inicia sesión cada día',
    targetCount: 1,
    rewardType: 'BONUS',
    rewardAmount: 20,
  },
  {
    key: 'play_3_games',
    name: 'Juega 3 Partidas',
    description: 'Juega 3 partidas hoy',
    targetCount: 3,
    rewardType: 'BONUS',
    rewardAmount: 50,
  },
  {
    key: 'first_win',
    name: 'Primera Victoria',
    description: 'Gana tu primera partida del día',
    targetCount: 1,
    rewardType: 'BONUS',
    rewardAmount: 30,
  },
  {
    key: 'complete_all',
    name: 'Completar Todas',
    description: 'Completa todas las misiones diarias',
    targetCount: 1,
    rewardType: 'BONUS',
    rewardAmount: 100,
  },
];
```

### Triggers de Misiones

```typescript
// En GamesService.joinGame()
await missionsService.incrementProgress(userId, 'play_3_games');

// En GamesService.claimBingo() (si gana)
if (position === 1) {
  await missionsService.incrementProgress(userId, 'first_win');
}

// En AuthService.login()
await missionsService.incrementProgress(userId, 'login_daily');

// Auto-completar "complete_all" cuando las otras 3 están listas
```

### Reset Diario

```typescript
// Cron job ejecuta a las 00:00
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async resetDailyMissions() {
  await prisma.userDailyMission.updateMany({
    where: {},
    data: {
      currentCount: 0,
      isCompleted: false,
      completedAt: null,
      lastResetAt: new Date(),
    },
  });
}
```

---

## Casos de Uso

### Caso de Uso 1: Jugar Partida Rápida

**Actor**: Usuario registrado

**Precondiciones**:
- Usuario tiene sesión activa
- Usuario tiene ≥10 créditos

**Flujo Principal**:
1. Usuario navega a "Selector de Salas"
2. Selecciona "Sala Principiante" (10 créditos)
3. Sistema muestra salas disponibles
4. Usuario se une a una sala con 2 jugadores
5. Host inicia el juego
6. Sistema sortea números cada 3 segundos
7. Usuario marca números en su cartón
8. Usuario canta "Bingo" (es el 2do en hacerlo)
9. Sistema valida el bingo
10. Usuario recibe 30% del prize pool (48 créditos)
11. Sistema muestra resultado final

**Postcondiciones**:
- Usuario gana 48 créditos CASH
- Misión "play_3_games" incrementa en 1
- Transacción registrada

### Caso de Uso 2: Completar Misiones Diarias

**Actor**: Usuario registrado

**Precondiciones**:
- Usuario inició sesión hoy
- Es un nuevo día (después del reset)

**Flujo Principal**:
1. Usuario abre la app (auto-completa "login_daily")
2. Usuario recibe +20 BONUS
3. Usuario juega 3 partidas (auto-incrementa "play_3_games")
4. Usuario gana 1 partida (auto-completa "first_win")
5. Sistema detecta que completó todas las misiones
6. Sistema auto-completa "complete_all"
7. Usuario recibe +100 BONUS adicionales

**Postcondiciones**:
- Usuario ganó 200 BONUS total
- Todas las misiones marcadas como completadas
- Reinician mañana a las 00:00

---

## Plan de Implementación

### Sesión 1 (2-3 horas)

#### Backend
1. **Actualizar GamesService** (1 hora)
   - Modificar `createGame()` con parámetro `cardSize`
   - Actualizar `joinGame()` con house edge
   - Actualizar `createCardForPlayer()` con tamaño dinámico
   - Actualizar `drawNumber()` con límite dinámico

2. **Implementar Premios Escalonados** (1 hora)
   - Método `finishGameWithPrizes()`
   - Método `updateParticipantPosition()`
   - Método `calculatePrize()`
   - Método `createTransaction()`

3. **Testing** (30 min)
   - Probar creación de juego 3x3
   - Probar distribución de premios
   - Verificar transacciones

#### Frontend
4. **Selector de Salas** (30 min)
   - Crear `apps/mobile/app/rooms.js`
   - Estilos y navegación

### Sesión 2 (2-3 horas)

#### Backend
1. **Crear MissionsModule** (1.5 horas)
   - `missions.module.ts`
   - `missions.service.ts`
   - `missions.controller.ts`
   - Configurar Cron Job

2. **Integrar Misiones con GameService** (30 min)
   - Triggers en `joinGame()`
   - Triggers en `claimBingo()`
   - Trigger en `AuthService.login()`

#### Frontend
3. **Pantalla de Misiones** (1 hora)
   - Crear `apps/mobile/app/missions.js`
   - API service calls
   - Progress bars
   - Botón de reclamar

### Sesión 3 (2 horas)

#### Frontend
1. **UI de Juego 3x3** (1.5 horas)
   - Crear `apps/mobile/app/game3x3.js`
   - Layout 3x3
   - WebSocket integration
   - Animaciones

2. **Testing E2E** (30 min)
   - Flujo completo de juego
   - Verificar premios
   - Verificar misiones

### Sesión 4 (1 hora)

1. **Recompilar y Deploy**
2. **Testing en Producción**
3. **Ajustes finales**
4. **Documentación de usuario**

---

## Resumen de Archivos a Crear/Modificar

### Backend - A Modificar
- ✅ `apps/backend/src/games/helpers/bingo-card-generator.ts` (COMPLETADO)
- 🔄 `apps/backend/src/games/games.service.ts`
- 🔄 `apps/backend/src/games/games.controller.ts`

### Backend - A Crear
- ⭐ `apps/backend/src/missions/missions.module.ts`
- ⭐ `apps/backend/src/missions/missions.service.ts`
- ⭐ `apps/backend/src/missions/missions.controller.ts`
- ⭐ `apps/backend/src/games/dto/create-rapid-game.dto.ts`

### Frontend - A Crear
- ⭐ `apps/mobile/app/rooms.js`
- ⭐ `apps/mobile/app/missions.js`
- ⭐ `apps/mobile/app/game3x3.js`
- ⭐ `apps/mobile/services/missions.service.js`

### Frontend - A Modificar
- 🔄 `apps/mobile/app/_layout.js` (agregar rutas)
- 🔄 `apps/mobile/app/index.js` (botón de misiones)

---

## Conclusión

Este diseño técnico proporciona una guía completa para implementar el sistema de Bingo Rápido 3x3 con premios escalonados y misiones diarias.

**Beneficios esperados**:
- Mayor engagement (partidas cortas y adictivas)
- Retención diaria (misiones resetean cada día)
- Monetización sostenible (house edge del 20%)
- Experiencia justa (premios escalonados, no todo o nada)

**Próximo paso**: Iniciar implementación siguiendo el plan de sesiones.

---

**Documento**: `DISENO_TECNICO_BINGO_3X3.md`
**Versión**: 1.0
**Estado**: ✅ Aprobado para implementación
**Fecha**: 2026-01-25
