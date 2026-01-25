import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { GameStatus, GameMode } from '@prisma/client';
import { CreateGameDto } from './dto';
import { UsersService } from '../users/users.service';
import { BingoCardGenerator } from './helpers';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
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
  ) {
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
    const savedGame = await this.prisma.game.create({
      data: {
        mode: GameMode.MULTIPLAYER,
        betAmount,
        prizePool: 0, // Se actualizará cuando los jugadores se unan
        maxPlayers,
        hostId: userId,
        currentPlayers: 0,
        isPrivate,
      },
    });

    return this.findOne(savedGame.id);
  }

  /**
   * Unirse a un juego existente
   */
  async joinGame(
    gameId: string,
    userId: string,
    betAmount: number,
  ) {
    const game = await this.findOne(gameId);

    // Validaciones
    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Game already started');
    }

    if (game.currentPlayers >= game.maxPlayers) {
      throw new BadRequestException('Game is full');
    }

    // Verificar que el jugador no esté ya en el juego
    const existingCard = await this.prisma.bingoCard.findFirst({
      where: { gameId, userId },
    });

    if (existingCard) {
      throw new ConflictException('Player already in game');
    }

    // Validar que el betAmount coincida con el del juego
    if (betAmount !== Number(game.betAmount)) {
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
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        prizePool: Number(game.prizePool) + Number(betAmount),
        currentPlayers: game.currentPlayers + 1,
      },
    });

    // Crear cartón
    const card = await this.createCardForPlayer(gameId, userId);

    return { game: await this.findOne(gameId), card };
  }

  /**
   * Crear un cartón para un jugador
   */
  private async createCardForPlayer(gameId: string, userId: string) {
    const numbers = BingoCardGenerator.generateCard();

    return await this.prisma.bingoCard.create({
      data: {
        gameId,
        userId,
        numbers,
        markedNumbers: [],
        markedCount: 0,
      },
    });
  }

  /**
   * Iniciar un juego (solo el host puede iniciar)
   */
  async startGame(gameId: string, userId?: string) {
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

    return await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.PLAYING,
        startedAt: new Date(),
        drawnNumbers: [],
        currentNumber: null,
      },
    });
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
      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          status: GameStatus.FINISHED,
          finishedAt: new Date(),
        },
      });
      return null;
    }

    // Generar número aleatorio que no haya sido sacado
    let number: number;
    do {
      number = Math.floor(Math.random() * 75) + 1;
    } while (game.drawnNumbers.includes(number));

    const drawnNumbers = [...game.drawnNumbers, number];

    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        drawnNumbers,
        currentNumber: number,
      },
    });

    return number;
  }

  /**
   * Marcar número en un cartón
   */
  async markNumber(
    cardId: string,
    userId: string,
    number: number,
  ) {
    const card = await this.prisma.bingoCard.findFirst({
      where: { id: cardId, userId },
      include: { game: true },
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
    const hasNumber = (card.numbers as number[][]).flat().includes(number);
    if (!hasNumber) {
      throw new BadRequestException('Number not in card');
    }

    // Marcar el número si no está ya marcado
    if (!card.markedNumbers.includes(number)) {
      const markedNumbers = [...card.markedNumbers, number];

      return await this.prisma.bingoCard.update({
        where: { id: cardId },
        data: { markedNumbers },
      });
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

    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.FINISHED,
        winnerId: userId,
        finishedAt: new Date(),
      },
    });

    // Otorgar premio al ganador
    await this.usersService.addCredits(userId, Number(game.prizePool));
  }

  /**
   * Obtener un juego por ID
   */
  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        cards: true,
        winner: true,
        host: true,
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return game;
  }

  /**
   * Obtener juegos disponibles para unirse
   */
  async getAvailableGames() {
    return await this.prisma.game.findMany({
      where: {
        status: GameStatus.WAITING,
        mode: GameMode.MULTIPLAYER,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Obtener cartones de un jugador en un juego
   */
  async getPlayerCards(userId: string, gameId: string) {
    return await this.prisma.bingoCard.findMany({
      where: { userId, gameId },
      include: { game: true },
    });
  }

  /**
   * Obtener todos los cartones de un juego
   */
  async getGameCards(gameId: string) {
    return await this.prisma.bingoCard.findMany({
      where: { gameId },
      include: { user: true },
    });
  }

  /**
   * Cancelar un juego (solo si está en espera)
   */
  async cancelGame(gameId: string, userId: string) {
    const game = await this.findOne(gameId);

    if (game.hostId !== userId) {
      throw new BadRequestException('Only host can cancel the game');
    }

    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Can only cancel waiting games');
    }

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: { status: GameStatus.CANCELLED },
    });

    // Devolver créditos a todos los jugadores
    const cards = await this.getGameCards(gameId);
    for (const card of cards) {
      await this.usersService.addCredits(card.userId, Number(game.betAmount));
    }

    return updatedGame;
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
    card: any;
    winnings?: number;
  }> {
    const card = await this.prisma.bingoCard.findFirst({
      where: { id: cardId, userId },
      include: { game: true },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.game.status !== GameStatus.PLAYING) {
      throw new BadRequestException('Game is not playing');
    }

    // Verificar si el cartón tiene bingo
    const hasBingo = BingoCardGenerator.checkBingo(
      card.numbers as number[][],
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
  ): Promise<[any[], number]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isPrivate !== undefined) {
      where.isPrivate = filters.isPrivate;
    }

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { host: true },
      }),
      this.prisma.game.count({ where }),
    ]);

    return [games, total];
  }

  /**
   * Obtener juegos creados por un usuario
   */
  async findByCreator(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[any[], number]> {
    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where: { hostId: userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { host: true },
      }),
      this.prisma.game.count({ where: { hostId: userId } }),
    ]);

    return [games, total];
  }

  /**
   * Obtener juegos en los que participa un usuario
   */
  async findByPlayer(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[any[], number]> {
    const [cards, total] = await Promise.all([
      this.prisma.bingoCard.findMany({
        where: { userId },
        include: {
          game: {
            include: { host: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.bingoCard.count({ where: { userId } }),
    ]);

    const games = cards.map((card) => card.game);

    return [games, total];
  }

  /**
   * Obtener el cartón de un usuario en un juego específico
   */
  async getUserCard(gameId: string, userId: string) {
    return await this.prisma.bingoCard.findFirst({
      where: { gameId, userId },
      include: { game: true },
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
  ): Promise<[any[], number]> {
    // Obtener juegos donde el usuario participó (tiene un cartón)
    const [cards, total] = await Promise.all([
      this.prisma.bingoCard.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              host: true,
              winner: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.bingoCard.count({ where: { userId } }),
    ]);

    // Filtrar solo juegos terminados
    const finishedGames = cards
      .map((card) => card.game)
      .filter((game) => game.status === GameStatus.FINISHED);

    return [finishedGames, total];
  }

  /**
   * Obtener estadísticas generales de un usuario
   */
  async getUserStatistics(userId: string) {
    const cards = await this.prisma.bingoCard.findMany({
      where: { userId },
      include: { game: true },
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
