import { UserResponseDto } from '../../users/dto';

export class AuthResponseDto {
  access_token: string;
  user: UserResponseDto;
}
