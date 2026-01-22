import { Exclude, Expose, Type } from 'class-transformer';
import { GameStatus, GameMode, Game } from '../entities/game.entity';

@Exclude()
export class GameResponseDto {
  @Expose()
  id: string;

  @Expose()
  mode: GameMode;

  @Expose()
  status: GameStatus;

  @Expose()
  betAmount: number;

  @Expose()
  prizePool: number;

  @Expose()
  drawnNumbers: number[];

  @Expose()
  currentNumber: number | null;

  @Expose()
  winnerId?: string;

  @Expose()
  hostId?: string;

  @Expose()
  maxPlayers: number;

  @Expose()
  currentPlayers: number;

  @Expose()
  isPrivate: boolean;

  @Expose()
  startedAt?: Date;

  @Expose()
  finishedAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(game: Game): GameResponseDto {
    const dto = new GameResponseDto();
    dto.id = game.id;
    dto.mode = game.mode;
    dto.status = game.status;
    dto.betAmount = game.betAmount;
    dto.prizePool = game.prizePool;
    dto.drawnNumbers = game.drawnNumbers || [];
    dto.currentNumber = game.currentNumber;
    dto.winnerId = game.winnerId;
    dto.hostId = game.hostId;
    dto.maxPlayers = game.maxPlayers;
    dto.currentPlayers = game.currentPlayers;
    dto.isPrivate = game.isPrivate;
    dto.startedAt = game.startedAt;
    dto.finishedAt = game.finishedAt;
    dto.createdAt = game.createdAt;
    dto.updatedAt = game.updatedAt;
    return dto;
  }
}
