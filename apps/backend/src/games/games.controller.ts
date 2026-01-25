import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto, JoinGameDto, GameResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';
import { UserPayload } from '../common/interfaces';
import { PaginationDto } from '../common/dto';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  /**
   * Create a new game
   * POST /games
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @CurrentUser() user: UserPayload,
  ): Promise<GameResponseDto> {
    const game = await this.gamesService.createGame(
      user.id,
      createGameDto.maxPlayers,
      createGameDto.betAmount,
      createGameDto.isPrivate,
    );

    return GameResponseDto.fromEntity(game);
  }

  /**
   * Get all available games (with pagination and filters)
   * GET /games?page=1&limit=10&status=waiting
   */
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
    @Query('isPrivate') isPrivate?: string,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    const filters: any = {};
    if (status) filters.status = status;
    if (isPrivate !== undefined) filters.isPrivate = isPrivate === 'true';

    const [games, total] = await this.gamesService.findAll(
      page,
      limit,
      filters,
    );

    return {
      data: games.map((game) => GameResponseDto.fromEntity(game)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific game by ID
   * GET /games/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GameResponseDto> {
    const game = await this.gamesService.findOne(id);
    return GameResponseDto.fromEntity(game);
  }

  /**
   * Get games created by the current user
   * GET /games/my/created
   */
  @Get('my/created')
  async findMyCreatedGames(
    @CurrentUser() user: UserPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    const [games, total] = await this.gamesService.findByCreator(
      user.id,
      page,
      limit,
    );

    return {
      data: games.map((game) => GameResponseDto.fromEntity(game)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get games the current user is participating in
   * GET /games/my/playing
   */
  @Get('my/playing')
  async findMyPlayingGames(
    @CurrentUser() user: UserPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    const [games, total] = await this.gamesService.findByPlayer(
      user.id,
      page,
      limit,
    );

    return {
      data: games.map((game) => GameResponseDto.fromEntity(game)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get the user's card for a specific game
   * GET /games/:id/my-card
   */
  @Get(':id/my-card')
  async getMyCard(
    @Param('id', ParseUUIDPipe) gameId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const card = await this.gamesService.getUserCard(gameId, user.id);

    if (!card) {
      return { card: null };
    }

    return { card };
  }

  /**
   * Get game statistics
   * GET /games/:id/stats
   */
  @Get(':id/stats')
  async getGameStats(@Param('id', ParseUUIDPipe) gameId: string) {
    const stats = await this.gamesService.getGameStats(gameId);
    return stats;
  }

  /**
   * Join a game (alternative REST endpoint, WebSocket is preferred)
   * POST /games/:id/join
   */
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinGame(
    @Param('id', ParseUUIDPipe) gameId: string,
    @Body() joinGameDto: JoinGameDto,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.gamesService.joinGame(
      gameId,
      user.id,
      joinGameDto.betAmount,
    );

    return {
      game: GameResponseDto.fromEntity(result.game),
      card: result.card,
    };
  }

  /**
   * Start a game (alternative REST endpoint, WebSocket is preferred)
   * POST /games/:id/start
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startGame(
    @Param('id', ParseUUIDPipe) gameId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const game = await this.gamesService.startGame(gameId, user.id);
    return GameResponseDto.fromEntity(game);
  }

  /**
   * Get game history for the current user
   * GET /games/my/history
   */
  @Get('my/history')
  async getMyHistory(
    @CurrentUser() user: UserPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    const [games, total] = await this.gamesService.getHistory(
      user.id,
      page,
      limit,
    );

    return {
      data: games.map((game) => GameResponseDto.fromEntity(game)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user statistics across all games
   * GET /games/my/statistics
   */
  @Get('my/statistics')
  async getMyStatistics(@CurrentUser() user: UserPayload) {
    const stats = await this.gamesService.getUserStatistics(user.id);
    return stats;
  }
}
