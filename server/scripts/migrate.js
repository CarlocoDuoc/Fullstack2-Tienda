import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getPool } from "../src/db.js";

const ruta = fileURLToPath(new URL("../sql/schema.sql", import.meta.url));

try {
  const sql = await readFile(ruta, "utf8");
  await getPool().query(sql);
  console.log("✔ Tablas creadas / verificadas en la base de datos.");
} catch (error) {
  console.error("✖ No se pudo ejecutar la migración:", error.message);
  process.exitCode = 1;
} finally {
  await getPool().end();
}
