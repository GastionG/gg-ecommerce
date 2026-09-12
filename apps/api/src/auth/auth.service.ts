import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import type { AuthUser, UserRole } from '@gg/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_MAX_AGE_MS,
} from './auth.constants.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthUser> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.client.orm.public.User.where({
      email,
    }).first();
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.client.orm.public.User.create({
      email,
      passwordHash,
      role: 'USER',
    });
    return toAuthUser(user);
  }

  async login(dto: LoginDto): Promise<AuthUser> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.client.orm.public.User.where({
      email,
    }).first();
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return toAuthUser(user);
  }

  setAuthCookie(res: Response, user: AuthUser) {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    res.cookie(ACCESS_TOKEN_COOKIE, token, cookieOptions());
  }

  clearAuthCookie(res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions());
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  };
}

function toAuthUser(user: {
  id: number;
  email: string;
  role: UserRole;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
