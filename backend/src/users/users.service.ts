import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UpdateCreditsDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { PaginationDto, PaginatedResult } from '../common/dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el usuario o email ya existe
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Crear usuario con créditos iniciales
    const initialCredits = this.configService.get<number>('game.initialCredits');
    const user = this.userRepository.create({
      ...createUserDto,
      credits: initialCredits,
    });

    return await this.userRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<User>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

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
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password', 'credits', 'isActive', 'avatar', 'createdAt', 'updatedAt'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password', 'credits', 'isActive', 'avatar', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Verificar si el username o email ya está en uso por otro usuario
    if (updateUserDto.username || updateUserDto.email) {
      const conditions: any[] = [];
      if (updateUserDto.username) {
        conditions.push({ username: updateUserDto.username });
      }
      if (updateUserDto.email) {
        conditions.push({ email: updateUserDto.email });
      }

      const existingUser = await this.userRepository.findOne({
        where: conditions,
      });

      if (existingUser && existingUser.id !== id) {
        if (existingUser.username === updateUserDto.username) {
          throw new ConflictException('Username already exists');
        }
        if (existingUser.email === updateUserDto.email) {
          throw new ConflictException('Email already exists');
        }
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateCredits(id: string, updateCreditsDto: UpdateCreditsDto): Promise<User> {
    const user = await this.findOne(id);
    user.credits = Number(updateCreditsDto.amount);
    return await this.userRepository.save(user);
  }

  async addCredits(id: string, amount: number): Promise<User> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const user = await this.findOne(id);
    user.credits = Number(user.credits) + Number(amount);
    return await this.userRepository.save(user);
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

    user.credits = currentCredits - Number(amount);
    return await this.userRepository.save(user);
  }

  async hasCredits(id: string, amount: number): Promise<boolean> {
    const user = await this.findOne(id);
    return Number(user.credits) >= Number(amount);
  }
}
