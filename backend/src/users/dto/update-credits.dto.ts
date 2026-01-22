import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateCreditsDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}
