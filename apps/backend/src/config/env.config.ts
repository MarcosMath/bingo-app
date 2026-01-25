export default () => ({
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  appName: process.env.APP_NAME || 'Bingo API',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'bingo_db',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
  },

  // Game Settings
  game: {
    initialCredits: parseInt(process.env.INITIAL_CREDITS, 10) || 100,
    minBet: parseInt(process.env.MIN_BET, 10) || 10,
    maxBet: parseInt(process.env.MAX_BET, 10) || 1000,
  },
});
