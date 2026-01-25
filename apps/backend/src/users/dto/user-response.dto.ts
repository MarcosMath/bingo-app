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
  credits: number;

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
    dto.credits = Number(user.credits);
    dto.isActive = user.isActive;
    dto.avatar = user.avatar;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
