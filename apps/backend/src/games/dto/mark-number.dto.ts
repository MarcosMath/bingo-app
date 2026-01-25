import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class MarkNumberDto {
  @IsUUID()
  cardId: string;

  @IsInt()
  @Min(1)
  @Max(75)
  number: number;
}
