import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  nickname: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}
