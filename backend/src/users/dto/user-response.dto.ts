import { Exclude, Expose } from 'class-transformer';

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
}
