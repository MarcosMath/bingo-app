import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateCreditsDto,
  UserResponseDto,
} from './dto';
import { PaginationDto } from '../common/dto';
import { plainToInstance } from 'class-transformer';
import { CurrentUser, Public } from '../common/decorators';
import { UserPayload } from '../common/interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return plainToInstance(UserResponseDto, user);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.usersService.findAll(paginationDto);
    return {
      ...result,
      data: plainToInstance(UserResponseDto, result.data),
    };
  }

  @Get('me')
  async getProfile(@CurrentUser() user: UserPayload) {
    const userData = await this.usersService.findOne(user.id);
    return plainToInstance(UserResponseDto, userData);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return plainToInstance(UserResponseDto, user);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }

  @Patch(':id/credits')
  async updateCredits(
    @Param('id') id: string,
    @Body() updateCreditsDto: UpdateCreditsDto,
  ) {
    const user = await this.usersService.updateCredits(id, updateCreditsDto);
    return plainToInstance(UserResponseDto, user);
  }

  @Post(':id/credits/add')
  async addCredits(
    @Param('id') id: string,
    @Body() updateCreditsDto: UpdateCreditsDto,
  ) {
    const user = await this.usersService.addCredits(
      id,
      updateCreditsDto.amount,
    );
    return plainToInstance(UserResponseDto, user);
  }

  @Post(':id/credits/deduct')
  async deductCredits(
    @Param('id') id: string,
    @Body() updateCreditsDto: UpdateCreditsDto,
  ) {
    const user = await this.usersService.deductCredits(
      id,
      updateCreditsDto.amount,
    );
    return plainToInstance(UserResponseDto, user);
  }
}
