import {
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { GameMode } from '../entities/game.entity';

export class CreateGameDto {
  @IsNumber()
  @Min(10)
  @Max(1000)
  betAmount: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxPlayers?: number;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
