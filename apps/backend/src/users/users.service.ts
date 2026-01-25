import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { CreateUserDto, UpdateUserDto, UpdateCreditsDto } from './dto';
import { PaginationDto, PaginatedResult } from '../common/dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el usuario o email ya existe
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // Crear usuario con créditos iniciales (dejar que use el default del schema)
    return await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<User>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    // Verificar si el username o email ya está en uso por otro usuario
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            updateUserDto.username ? { username: updateUserDto.username } : {},
            updateUserDto.email ? { email: updateUserDto.email } : {},
          ],
          NOT: { id },
        },
      });

      if (existingUser) {
        if (existingUser.username === updateUserDto.username) {
          throw new ConflictException('Username already exists');
        }
        if (existingUser.email === updateUserDto.email) {
          throw new ConflictException('Email already exists');
        }
      }
    }

    // Hash password if it's being updated
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await this.hashPassword(updateUserDto.password);
    }

    return await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateCredits(id: string, updateCreditsDto: UpdateCreditsDto): Promise<User> {
    await this.findOne(id);
    return await this.prisma.user.update({
      where: { id },
      data: { credits: updateCreditsDto.amount },
    });
  }

  async addCredits(id: string, amount: number): Promise<User> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    await this.findOne(id);
    return await this.prisma.user.update({
      where: { id },
      data: { credits: { increment: amount } },
    });
  }

  async deductCredits(id: string, amount: number): Promise<User> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const user = await this.findOne(id);
    const currentCredits = Number(user.credits);

    if (currentCredits < amount) {
      throw new BadRequestException('Insufficient credits');
    }

    return await this.prisma.user.update({
      where: { id },
      data: { credits: { decrement: amount } },
    });
  }

  async hasCredits(id: string, amount: number): Promise<boolean> {
    const user = await this.findOne(id);
    return Number(user.credits) >= Number(amount);
  }

  async comparePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }
}
