import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CardResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  gameId: string;

  @Expose()
  numbers: number[][];

  @Expose()
  markedNumbers: number[];

  @Expose()
  hasWon: boolean;

  @Expose()
  markedCount: number;

  @Expose()
  createdAt: Date;
}
