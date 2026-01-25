import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GamesService } from './games.service';
import { MarkNumberDto } from './dto';
import { UserPayload } from '../common/interfaces';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/games',
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GamesGateway.name);
  private readonly userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private readonly gamesService: GamesService,
    private readonly jwtService: JwtService,
  ) {}

  // Handle client connection
  async handleConnection(client: Socket) {
    try {
      // Extract and verify JWT token from handshake
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token`);
        client.disconnect();
        return;
      }

      // Verify and decode token
      const payload = await this.verifyToken(token);
      if (!payload) {
        this.logger.warn(`Client ${client.id} connection rejected: Invalid token`);
        client.disconnect();
        return;
      }

      // Store user info in socket
      client.data.userId = payload.id;
      client.data.username = payload.username;

      // Track user's socket connections
      if (!this.userSockets.has(payload.id)) {
        this.userSockets.set(payload.id, new Set());
      }
      this.userSockets.get(payload.id).add(client.id);

      this.logger.log(
        `Client connected: ${client.id} (User: ${payload.username})`,
      );
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  // Handle client disconnection
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    const username = client.data.username;

    if (userId) {
      // Remove socket from user's connections
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }

      // Handle game disconnection if user was in a game
      try {
        await this.handleGameDisconnection(userId);
      } catch (error) {
        this.logger.error(`Error handling game disconnection: ${error.message}`);
      }
    }

    this.logger.log(`Client disconnected: ${client.id} (User: ${username})`);
  }

  // Join a game room
  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; betAmount: number },
  ) {
    try {
      const userId = client.data.userId;
      const username = client.data.username;

      this.logger.log(
        `User ${username} joining game ${data.gameId} with bet ${data.betAmount}`,
      );

      // Join the game
      const result = await this.gamesService.joinGame(
        data.gameId,
        userId,
        data.betAmount,
      );

      // Join socket room
      await client.join(`game:${data.gameId}`);

      // Notify all players in the game
      this.server.to(`game:${data.gameId}`).emit('playerJoined', {
        gameId: data.gameId,
        player: {
          userId,
          username,
          betAmount: data.betAmount,
        },
        totalPlayers: result.game.currentPlayers,
      });

      // Send game state to the joining player
      return {
        success: true,
        game: result.game,
        card: result.card,
      };
    } catch (error) {
      this.logger.error(`Join game error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  // Start a game (only creator can start)
  @SubscribeMessage('startGame')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    try {
      const userId = client.data.userId;

      this.logger.log(`User ${userId} starting game ${data.gameId}`);

      const game = await this.gamesService.startGame(data.gameId, userId);

      // Notify all players that the game has started
      this.server.to(`game:${data.gameId}`).emit('gameStarted', {
        gameId: data.gameId,
        drawnNumbers: game.drawnNumbers,
        startedAt: game.startedAt,
      });

      // Start drawing numbers automatically
      this.startNumberDrawing(data.gameId);

      return { success: true, game };
    } catch (error) {
      this.logger.error(`Start game error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  // Mark a number on the card
  @SubscribeMessage('markNumber')
  async handleMarkNumber(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MarkNumberDto,
  ) {
    try {
      const userId = client.data.userId;

      const card = await this.gamesService.markNumber(
        data.cardId,
        userId,
        data.number,
      );

      // Send updated card back to the player
      return { success: true, card };
    } catch (error) {
      this.logger.error(`Mark number error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  // Claim bingo
  @SubscribeMessage('claimBingo')
  async handleClaimBingo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { cardId: string },
  ) {
    try {
      const userId = client.data.userId;
      const username = client.data.username;

      this.logger.log(`User ${username} claiming bingo with card ${data.cardId}`);

      const result = await this.gamesService.claimBingo(data.cardId, userId);

      if (result.isValid) {
        // Notify all players about the winner
        this.server.to(`game:${result.gameId}`).emit('gameEnded', {
          gameId: result.gameId,
          winner: {
            userId,
            username,
            winnings: result.winnings,
          },
          card: result.card,
        });

        // Stop number drawing
        this.stopNumberDrawing(result.gameId);
      }

      return {
        success: true,
        isValid: result.isValid,
        winnings: result.winnings,
      };
    } catch (error) {
      this.logger.error(`Claim bingo error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  // Leave a game
  @SubscribeMessage('leaveGame')
  async handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    try {
      const userId = client.data.userId;
      const username = client.data.username;

      await client.leave(`game:${data.gameId}`);

      // Notify other players
      this.server.to(`game:${data.gameId}`).emit('playerLeft', {
        gameId: data.gameId,
        player: {
          userId,
          username,
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Leave game error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  // Private helper methods

  private extractTokenFromSocket(client: Socket): string | null {
    // Try to get token from handshake auth
    const token = client.handshake.auth?.token;
    if (token) return token;

    // Try to get token from query params
    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') return queryToken;

    // Try to get token from headers
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  private async verifyToken(token: string): Promise<UserPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<UserPayload>(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  private async handleGameDisconnection(userId: string) {
    // This could be extended to handle player disconnection from active games
    // For now, we'll just log it
    this.logger.log(`Handling game disconnection for user ${userId}`);
  }

  // Number drawing system
  private readonly gameTimers = new Map<string, NodeJS.Timeout>();

  private startNumberDrawing(gameId: string) {
    // Clear any existing timer
    this.stopNumberDrawing(gameId);

    // Draw a number every 3 seconds
    const interval = setInterval(async () => {
      try {
        const number = await this.gamesService.drawNumber(gameId);

        if (number) {
          // Broadcast the drawn number to all players
          this.server.to(`game:${gameId}`).emit('numberDrawn', {
            gameId,
            number,
            timestamp: new Date(),
          });
        } else {
          // No more numbers to draw, game ends in draw
          this.server.to(`game:${gameId}`).emit('gameEndedDraw', {
            gameId,
            message: 'All numbers have been drawn with no winner',
          });
          this.stopNumberDrawing(gameId);
        }
      } catch (error) {
        this.logger.error(`Error drawing number for game ${gameId}: ${error.message}`);
        this.stopNumberDrawing(gameId);
      }
    }, 3000); // 3 seconds between numbers

    this.gameTimers.set(gameId, interval);
  }

  private stopNumberDrawing(gameId: string) {
    const timer = this.gameTimers.get(gameId);
    if (timer) {
      clearInterval(timer);
      this.gameTimers.delete(gameId);
    }
  }

  // Emit game state update to all players in a game
  emitGameUpdate(gameId: string, event: string, data: any) {
    this.server.to(`game:${gameId}`).emit(event, data);
  }
}
