// Modo "tiempo real" para las pruebas: vigila src/ y test/ y vuelve a correr Karma cada vez que guardas un archivo.
// Uso: npm run test:watch   (detener con Ctrl + C)
import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const karma = resolve(raiz, "node_modules", "karma", "bin", "karma");

let corriendo = false;
let pendiente = false;
let temporizador = null;

function ejecutar(motivo) {
  if (corriendo) {
    pendiente = true; // se guardó otro archivo mientras corría: repetir al terminar
    return;
  }
  corriendo = true;
  console.clear();
  console.log(`\n▶ Ejecutando pruebas (${motivo})...\n`);
  const proceso = spawn(process.execPath, [karma, "start", "karma.conf.cjs", "--single-run"], {
    cwd: raiz,
    stdio: "inherit",
  });
  proceso.on("exit", () => {
    corriendo = false;
    console.log("\n👀 Esperando cambios en src/ y test/ ... (Ctrl + C para salir)\n");
    if (pendiente) {
      pendiente = false;
      ejecutar("nuevo cambio");
    }
  });
}

function alCambiar(_evento, archivo) {
  if (!archivo || !/\.(jsx?|cjs|mjs)$/.test(String(archivo))) return;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => ejecutar(`cambió ${archivo}`), 300);
}

for (const carpeta of ["src", "test"]) {
  watch(resolve(raiz, carpeta), { recursive: true }, alCambiar);
}

ejecutar("inicio");
