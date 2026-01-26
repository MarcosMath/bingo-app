import { Exclude, Expose } from 'class-transformer';
import { User } from '@prisma/client';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  creditsCash: number;

  @Expose()
  creditsBonus: number;

  @Expose()
  creditsTotal: number;

  @Expose()
  isActive: boolean;

  @Expose()
  avatar?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.email = user.email;

    // Convertir Decimal de Prisma a número
    dto.creditsCash = user.creditsCash ? Number(user.creditsCash.toString()) : 0;
    dto.creditsBonus = user.creditsBonus ? Number(user.creditsBonus.toString()) : 0;
    dto.creditsTotal = dto.creditsCash + dto.creditsBonus;

    dto.isActive = user.isActive;
    dto.avatar = user.avatar;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
