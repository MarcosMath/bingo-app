import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Game } from './game.entity';

@Entity('bingo_cards')
export class BingoCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  gameId: string;

  @ManyToOne(() => Game, (game) => game.cards)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column({ type: 'json' })
  numbers: number[][];

  @Column({ type: 'json', default: '[]' })
  markedNumbers: number[];

  @Column({ default: false })
  hasWon: boolean;

  @Column({ type: 'int', default: 0 })
  markedCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
