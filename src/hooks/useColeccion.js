import { useSyncExternalStore } from "react";

// Devuelve la lista de una colección de data/db.js y vuelve a renderizar el
// componente cada vez que esa colección cambia.
export function useColeccion(coleccion) {
  return useSyncExternalStore(coleccion.suscribir, coleccion.obtenerSnapshot);
}
