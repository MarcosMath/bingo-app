/**
 * Game-related types shared between frontend and backend
 */

export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export enum GameMode {
  CLASSIC = 'CLASSIC',
  SPEED = 'SPEED',
  PATTERN = 'PATTERN',
}

export interface GameResponse {
  id: string;
  hostId: string;
  winnerId?: string;
  status: GameStatus;
  mode: GameMode;
  betAmount: number;
  maxPlayers: number;
  currentPlayers: number;
  drawnNumbers: number[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface CreateGameDto {
  mode: GameMode;
  betAmount: number;
  maxPlayers: number;
}

export interface JoinGameDto {
  gameId: string;
}

export interface BingoCardResponse {
  id: string;
  userId: string;
  gameId: string;
  numbers: number[][];
  markedPositions: number[][];
  createdAt: Date;
}

export interface DrawNumberDto {
  gameId: string;
}

export interface MarkNumberDto {
  cardId: string;
  number: number;
}

// WebSocket event types
export interface GameEvent {
  type: 'GAME_CREATED' | 'GAME_STARTED' | 'GAME_FINISHED' | 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'NUMBER_DRAWN' | 'BINGO_CLAIMED';
  gameId: string;
  data: any;
}

export interface NumberDrawnEvent {
  number: number;
  drawnNumbers: number[];
}

export interface PlayerJoinedEvent {
  playerId: string;
  username: string;
  currentPlayers: number;
}

export interface BingoClaimedEvent {
  playerId: string;
  username: string;
  cardId: string;
  verified: boolean;
}
