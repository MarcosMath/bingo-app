// Este archivo ya no es necesario con Prisma
// La configuración de la base de datos ahora está en:
// - prisma/schema.prisma
// - prisma.config.ts
// - .env (DATABASE_URL)

export const getDatabaseConfig = () => {
  console.warn('database.config.ts is deprecated with Prisma migration');
  return {};
};
