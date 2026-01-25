import { IsNumber, Min, Max } from 'class-validator';

export class JoinGameDto {
  @IsNumber()
  @Min(10)
  @Max(1000)
  betAmount: number;
}
