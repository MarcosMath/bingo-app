import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameStatus, GameMode } from './entities/game.entity';
import { BingoCard } from './entities/bingo-card.entity';
import { CreateGameDto } from './dto';
import { UsersService } from '../users/users.service';
import { BingoCardGenerator } from './helpers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(BingoCard)
    private readonly cardRepository: Repository<BingoCard>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Crea un nuevo juego
   */
  async createGame(
    userId: string,
    maxPlayers: number = 4,
    betAmount: number,
    isPrivate: boolean = false,
  ): Promise<Game> {
    // Validar que el usuario tenga créditos suficientes
    const hasCredits = await this.usersService.hasCredits(userId, betAmount);
    if (!hasCredits) {
      throw new BadRequestException('Insufficient credits');
    }

    // Validar bet amount con configuración
    const minBet = this.configService.get<number>('game.minBet') || 10;
    const maxBet = this.configService.get<number>('game.maxBet') || 1000;

    if (betAmount < minBet || betAmount > maxBet) {
      throw new BadRequestException(
        `Bet amount must be between ${minBet} and ${maxBet}`,
      );
    }

    // Crear juego
    const game = this.gameRepository.create({
      mode: GameMode.MULTIPLAYER,
      betAmount,
      prizePool: 0, // Se actualizará cuando los jugadores se unan
      maxPlayers,
      hostId: userId,
      currentPlayers: 0,
      isPrivate,
    });

    const savedGame = await this.gameRepository.save(game);

    return this.findOne(savedGame.id);
  }

  /**
   * Unirse a un juego existente
   */
  async joinGame(
    gameId: string,
    userId: string,
    betAmount: number,
  ): Promise<{ game: Game; card: BingoCard }> {
    const game = await this.findOne(gameId);

    // Validaciones
    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Game already started');
    }

    if (game.currentPlayers >= game.maxPlayers) {
      throw new BadRequestException('Game is full');
    }

    // Verificar que el jugador no esté ya en el juego
    const existingCard = await this.cardRepository.findOne({
      where: { gameId, userId },
    });

    if (existingCard) {
      throw new ConflictException('Player already in game');
    }

    // Validar que el betAmount coincida con el del juego
    if (betAmount !== game.betAmount) {
      throw new BadRequestException(
        `Bet amount must be ${game.betAmount} for this game`,
      );
    }

    // Validar créditos
    const hasCredits = await this.usersService.hasCredits(userId, betAmount);
    if (!hasCredits) {
      throw new BadRequestException('Insufficient credits');
    }

    // Deducir créditos
    await this.usersService.deductCredits(userId, betAmount);

    // Actualizar prize pool y jugadores
    game.prizePool = Number(game.prizePool) + Number(betAmount);
    game.currentPlayers += 1;
    await this.gameRepository.save(game);

    // Crear cartón
    const card = await this.createCardForPlayer(gameId, userId);

    return { game: await this.findOne(gameId), card };
  }

  /**
   * Crear un cartón para un jugador
   */
  private async createCardForPlayer(gameId: string, userId: string): Promise<BingoCard> {
    const numbers = BingoCardGenerator.generateCard();

    const card = this.cardRepository.create({
      gameId,
      userId,
      numbers,
      markedNumbers: [],
      markedCount: 0,
    });

    return await this.cardRepository.save(card);
  }

  /**
   * Iniciar un juego (solo el host puede iniciar)
   */
  async startGame(gameId: string, userId?: string): Promise<Game> {
    const game = await this.findOne(gameId);

    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Game already started or finished');
    }

    // Verificar que sea el host quien inicia (si se proporciona userId)
    if (userId && game.hostId !== userId) {
      throw new BadRequestException('Only the host can start the game');
    }

    // Verificar que haya al menos 1 jugador
    if (game.currentPlayers < 1) {
      throw new BadRequestException('Need at least 1 player to start');
    }

    game.status = GameStatus.PLAYING;
    game.startedAt = new Date();
    game.drawnNumbers = [];
    game.currentNumber = null;

    return await this.gameRepository.save(game);
  }

  /**
   * Sacar siguiente número (llamado por el gateway automáticamente)
   */
  async drawNumber(gameId: string): Promise<number | null> {
    const game = await this.findOne(gameId);

    if (game.status !== GameStatus.PLAYING) {
      throw new BadRequestException('Game is not playing');
    }

    if (game.drawnNumbers.length >= 75) {
      // Todos los números han sido sacados, terminar el juego
      game.status = GameStatus.FINISHED;
      game.finishedAt = new Date();
      await this.gameRepository.save(game);
      return null;
    }

    // Generar número aleatorio que no haya sido sacado
    let number: number;
    do {
      number = Math.floor(Math.random() * 75) + 1;
    } while (game.drawnNumbers.includes(number));

    game.drawnNumbers.push(number);
    game.currentNumber = number;

    await this.gameRepository.save(game);

    return number;
  }

  /**
   * Marcar número en un cartón
   */
  async markNumber(
    cardId: string,
    userId: string,
    number: number,
  ): Promise<BingoCard> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, userId },
      relations: ['game'],
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.game.status !== GameStatus.PLAYING) {
      throw new BadRequestException('Game is not playing');
    }

    // Verificar que el número haya sido sacado
    if (!card.game.drawnNumbers.includes(number)) {
      throw new BadRequestException('Number has not been drawn yet');
    }

    // Verificar que el número esté en el cartón
    const hasNumber = card.numbers.flat().includes(number);
    if (!hasNumber) {
      throw new BadRequestException('Number not in card');
    }

    // Marcar el número si no está ya marcado
    if (!card.markedNumbers.includes(number)) {
      card.markedNumbers.push(number);

      await this.cardRepository.save(card);
    }

    return card;
  }

  /**
   * Declarar ganador
   */
  private async declareWinner(gameId: string, userId: string): Promise<void> {
    const game = await this.findOne(gameId);

    if (game.status === GameStatus.FINISHED) {
      return; // Ya hay un ganador
    }

    game.status = GameStatus.FINISHED;
    game.winnerId = userId;
    game.finishedAt = new Date();

    await this.gameRepository.save(game);

    // Otorgar premio al ganador
    await this.usersService.addCredits(userId, Number(game.prizePool));
  }

  /**
   * Obtener un juego por ID
   */
  async findOne(id: string): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id },
      relations: ['cards', 'winner', 'host'],
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return game;
  }

  /**
   * Obtener juegos disponibles para unirse
   */
  async getAvailableGames(): Promise<Game[]> {
    return await this.gameRepository.find({
      where: {
        status: GameStatus.WAITING,
        mode: GameMode.MULTIPLAYER,
      },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  /**
   * Obtener cartones de un jugador en un juego
   */
  async getPlayerCards(userId: string, gameId: string): Promise<BingoCard[]> {
    return await this.cardRepository.find({
      where: { userId, gameId },
      relations: ['game'],
    });
  }

  /**
   * Obtener todos los cartones de un juego
   */
  async getGameCards(gameId: string): Promise<BingoCard[]> {
    return await this.cardRepository.find({
      where: { gameId },
      relations: ['user'],
    });
  }

  /**
   * Cancelar un juego (solo si está en espera)
   */
  async cancelGame(gameId: string, userId: string): Promise<Game> {
    const game = await this.findOne(gameId);

    if (game.hostId !== userId) {
      throw new BadRequestException('Only host can cancel the game');
    }

    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Can only cancel waiting games');
    }

    game.status = GameStatus.CANCELLED;
    await this.gameRepository.save(game);

    // Devolver créditos a todos los jugadores
    const cards = await this.getGameCards(gameId);
    for (const card of cards) {
      await this.usersService.addCredits(card.userId, Number(game.betAmount));
    }

    return game;
  }

  /**
   * Reclamar bingo (verificar si el jugador ganó)
   */
  async claimBingo(
    cardId: string,
    userId: string,
  ): Promise<{
    isValid: boolean;
    gameId: string;
    card: BingoCard;
    winnings?: number;
  }> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, userId },
      relations: ['game'],
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.game.status !== GameStatus.PLAYING) {
      throw new BadRequestException('Game is not playing');
    }

    // Verificar si el cartón tiene bingo
    const hasBingo = BingoCardGenerator.checkBingo(
      card.numbers,
      card.markedNumbers,
    );

    if (hasBingo) {
      // Marcar como ganador
      await this.declareWinner(card.game.id, userId);

      return {
        isValid: true,
        gameId: card.game.id,
        card,
        winnings: Number(card.game.prizePool),
      };
    }

    return {
      isValid: false,
      gameId: card.game.id,
      card,
    };
  }

  /**
   * Obtener todos los juegos con filtros y paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: any,
  ): Promise<[Game[], number]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isPrivate !== undefined) {
      where.isPrivate = filters.isPrivate;
    }

    return await this.gameRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['host'],
    });
  }

  /**
   * Obtener juegos creados por un usuario
   */
  async findByCreator(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Game[], number]> {
    return await this.gameRepository.findAndCount({
      where: { hostId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['host'],
    });
  }

  /**
   * Obtener juegos en los que participa un usuario
   */
  async findByPlayer(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Game[], number]> {
    const cards = await this.cardRepository.find({
      where: { userId },
      relations: ['game', 'game.host'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const games = cards.map((card) => card.game);
    const total = await this.cardRepository.count({ where: { userId } });

    return [games, total];
  }

  /**
   * Obtener el cartón de un usuario en un juego específico
   */
  async getUserCard(gameId: string, userId: string): Promise<BingoCard | null> {
    return await this.cardRepository.findOne({
      where: { gameId, userId },
      relations: ['game'],
    });
  }

  /**
   * Obtener estadísticas de un juego
   */
  async getGameStats(gameId: string) {
    const game = await this.findOne(gameId);
    const cards = await this.getGameCards(gameId);

    return {
      gameId: game.id,
      status: game.status,
      totalPlayers: game.currentPlayers,
      maxPlayers: game.maxPlayers,
      prizePool: game.prizePool,
      numbersDrawn: game.drawnNumbers?.length || 0,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      winner: game.winner
        ? {
            id: game.winner.id,
            username: game.winner.username,
          }
        : null,
    };
  }

  /**
   * Obtener historial de juegos de un usuario
   */
  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Game[], number]> {
    // Obtener juegos donde el usuario participó (tiene un cartón)
    const cards = await this.cardRepository.find({
      where: { userId },
      relations: ['game', 'game.host', 'game.winner'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filtrar solo juegos terminados
    const finishedGames = cards
      .map((card) => card.game)
      .filter((game) => game.status === GameStatus.FINISHED);

    const total = await this.cardRepository.count({
      where: { userId },
    });

    return [finishedGames, total];
  }

  /**
   * Obtener estadísticas generales de un usuario
   */
  async getUserStatistics(userId: string) {
    const cards = await this.cardRepository.find({
      where: { userId },
      relations: ['game'],
    });

    const gamesPlayed = cards.length;
    const gamesWon = cards.filter((card) => card.game.winnerId === userId).length;
    const gamesLost = cards.filter(
      (card) =>
        card.game.status === GameStatus.FINISHED &&
        card.game.winnerId !== userId,
    ).length;

    const totalWinnings = cards
      .filter((card) => card.game.winnerId === userId)
      .reduce((sum, card) => sum + Number(card.game.prizePool), 0);

    const totalBets = cards.reduce(
      (sum, card) => sum + Number(card.game.betAmount),
      0,
    );

    const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;

    return {
      gamesPlayed,
      gamesWon,
      gamesLost,
      winRate: winRate.toFixed(2),
      totalWinnings,
      totalBets,
      netProfit: totalWinnings - totalBets,
    };
  }
}
