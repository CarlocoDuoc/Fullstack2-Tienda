import { randomInt } from "node:crypto";

// Ejemplo: DR-20261008-48213  (fecha + 5 dígitos aleatorios, difícil de adivinar)
export function generarCodigoOrden(fecha = new Date()) {
  const aaaammdd = fecha.toISOString().slice(0, 10).replaceAll("-", "");
  return `DR-${aaaammdd}-${randomInt(10000, 100000)}`;
}
