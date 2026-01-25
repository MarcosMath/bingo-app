/**
 * User-related types shared between frontend and backend
 */

export interface UserPayload {
  id: string;
  email: string;
  username: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  credits: number;
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserResponse;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  avatar?: string;
}

export interface UpdateCreditsDto {
  amount: number;
}
