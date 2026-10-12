import pg from "pg";
import { config } from "./config.js";

let pool = null;

// Neon entrega la cadena con `channel_binding=require`; el driver `pg` no lo necesita (la conexión ya va por SSL),
// así que se quita para evitar que una versión del driver rechace la conexión por ese parámetro.
export function limpiarUrl(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return url;
  }
}

export function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: limpiarUrl(config.databaseUrl),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    // Neon cierra conexiones inactivas: sin este manejador, el error tumbaría el servidor.
    pool.on("error", (error) => console.error("Error en una conexión inactiva de la base de datos:", error.message));
  }
  return pool;
}

export const consultar = (texto, parametros = []) => getPool().query(texto, parametros);

// Ejecuta `trabajo(cliente)` dentro de una transacción (COMMIT si termina bien, ROLLBACK si falla).
export async function transaccion(trabajo) {
  const cliente = await getPool().connect();
  try {
    await cliente.query("BEGIN");
    const resultado = await trabajo(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    cliente.release();
  }
}
