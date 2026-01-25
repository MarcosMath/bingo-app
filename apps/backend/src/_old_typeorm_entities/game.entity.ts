import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BingoCard } from './bingo-card.entity';

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum GameMode {
  SINGLE = 'single',
  MULTIPLAYER = 'multiplayer',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GameMode,
    default: GameMode.SINGLE,
  })
  mode: GameMode;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.WAITING,
  })
  status: GameStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  betAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  prizePool: number;

  @Column({ type: 'simple-array', default: '' })
  drawnNumbers: number[];

  @Column({ type: 'int', nullable: true })
  currentNumber: number | null;

  @Column({ nullable: true })
  winnerId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winnerId' })
  winner?: User;

  @Column({ nullable: true })
  hostId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'hostId' })
  host?: User;

  @Column({ type: 'int', default: 1 })
  maxPlayers: number;

  @Column({ type: 'int', default: 0 })
  currentPlayers: number;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @OneToMany(() => BingoCard, (card) => card.game)
  cards: BingoCard[];

  // Relaciones adicionales
  @OneToMany(() => BingoCard, (card) => card.game)
  players: BingoCard[];

  @Column({ nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  finishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
