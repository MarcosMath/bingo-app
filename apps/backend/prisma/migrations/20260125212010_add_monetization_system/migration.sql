-- CreateEnum
CREATE TYPE "CardSize" AS ENUM ('RAPID_3X3', 'CLASSIC_5X5');
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'GAME_BET', 'GAME_WIN', 'MISSION_REWARD', 'ADMIN_ADJUST', 'BONUS_GIFT');
CREATE TYPE "CreditType" AS ENUM ('CASH', 'BONUS');

-- AlterTable Users: Agregar nuevos campos de créditos
ALTER TABLE "users" ADD COLUMN "credits_cash" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "credits_bonus" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Migrar datos existentes: Mover créditos actuales a credits_cash
UPDATE "users" SET "credits_cash" = "credits" WHERE "credits" IS NOT NULL;

-- Usuarios nuevos tendrán 50 CASH + 100 BONUS por defecto
ALTER TABLE "users" ALTER COLUMN "credits_cash" SET DEFAULT 50;
ALTER TABLE "users" ALTER COLUMN "credits_bonus" SET DEFAULT 100;

-- Eliminar columna antigua de créditos
ALTER TABLE "users" DROP COLUMN "credits";

-- AlterTable Games: Agregar campos de tamaño de cartón y house edge
ALTER TABLE "games" ADD COLUMN "card_size" "CardSize" NOT NULL DEFAULT 'CLASSIC_5X5';
ALTER TABLE "games" ADD COLUMN "house_edge" DECIMAL(5,2) NOT NULL DEFAULT 20;

-- CreateTable GameParticipant
CREATE TABLE "game_participants" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "position" INTEGER,
    "prize" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable Transaction
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "credit_type" "CreditType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance_before" DECIMAL(10,2) NOT NULL,
    "balance_after" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable DailyMission
CREATE TABLE "daily_missions" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "reward_type" "CreditType" NOT NULL,
    "reward_amount" DECIMAL(10,2) NOT NULL,
    "target_count" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserDailyMission
CREATE TABLE "user_daily_missions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "last_reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_daily_missions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_participants_game_id_user_id_key" ON "game_participants"("game_id", "user_id");
CREATE UNIQUE INDEX "daily_missions_key_key" ON "daily_missions"("key");
CREATE UNIQUE INDEX "user_daily_missions_user_id_mission_id_key" ON "user_daily_missions"("user_id", "mission_id");

-- AddForeignKey
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_daily_missions" ADD CONSTRAINT "user_daily_missions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_daily_missions" ADD CONSTRAINT "user_daily_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "daily_missions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed: Insertar misiones diarias por defecto
INSERT INTO "daily_missions" ("id", "key", "name", "description", "reward_type", "reward_amount", "target_count", "created_at", "updated_at")
VALUES
    (gen_random_uuid(), 'login_daily', 'Login Diario', 'Inicia sesión cada día', 'BONUS', 20, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'play_3_games', 'Juega 3 Partidas', 'Juega 3 partidas hoy', 'BONUS', 50, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'first_win', 'Primera Victoria', 'Gana tu primera partida del día', 'BONUS', 30, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'complete_all', 'Completar Todas', 'Completa todas las misiones diarias', 'BONUS', 100, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
