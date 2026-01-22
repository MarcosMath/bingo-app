import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    CommonModule,
    UsersModule,
    AuthModule,
    GamesModule,
  ],
})
export class AppModule {}
