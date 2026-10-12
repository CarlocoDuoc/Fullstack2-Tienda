import "dotenv/config";

function requerida(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revisa server/.env (ver .env.example).`);
  }
  return valor;
}

export const config = {
  puerto: Number(process.env.PORT) || 3001,
  corsOrigenes: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  // Se leen de forma perezosa para que los tests puedan importar módulos sin .env
  get databaseUrl() {
    return requerida("DATABASE_URL");
  },
  get jwtSecret() {
    return requerida("JWT_SECRET");
  },
  jwtExpira: "8h",
};
