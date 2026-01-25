import { Module } from '@nestjs/common';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    CommonModule,
    UsersModule,
    AuthModule,
    GamesModule,
  ],
})
export class AppModule {}
