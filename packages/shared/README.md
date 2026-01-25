# @bingo/shared

Shared TypeScript types and interfaces for the Bingo game monorepo.

## Purpose

This package provides a single source of truth for type definitions used across both the mobile app and backend API. This ensures type safety and consistency throughout the application.

## Usage

### In Backend (NestJS)

```typescript
import { UserResponse, GameStatus, GameMode } from '@bingo/shared';

// Use types in your services, controllers, etc.
```

### In Mobile (React Native)

```typescript
import { UserResponse, AuthResponse, GameResponse } from '@bingo/shared';

// Use types in your components, hooks, etc.
```

## Available Types

### User Types
- `UserPayload` - JWT payload structure
- `UserResponse` - User data returned from API
- `LoginDto` - Login request data
- `RegisterDto` - Registration request data
- `AuthResponse` - Authentication response
- `UpdateUserDto` - User update request
- `UpdateCreditsDto` - Credits update request

### Game Types
- `GameStatus` - Enum for game states
- `GameMode` - Enum for game modes
- `GameResponse` - Game data returned from API
- `CreateGameDto` - Create game request
- `JoinGameDto` - Join game request
- `BingoCardResponse` - Bingo card data
- `DrawNumberDto` - Draw number request
- `MarkNumberDto` - Mark number request
- WebSocket event types

### API Types
- `PaginationDto` - Pagination request parameters
- `PaginationMeta` - Pagination metadata
- `PaginatedResult<T>` - Generic paginated response
- `ApiError` - Standard error response
- `ApiResponse<T>` - Generic API response wrapper

## Building

```bash
npm run build
```

## Development

```bash
npm run watch
```
