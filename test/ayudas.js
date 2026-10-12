// Ayudas compartidas por los tests (este archivo no es un spec, Karma no lo ejecuta solo).
import { waitFor } from "@testing-library/react";

// En Jasmine, expect() NO lanza error al fallar, así que waitFor(() => expect(...)) nunca reintenta.
// Esta ayuda lanza un error de verdad hasta que la condición se cumple.
export const esperarQue = (condicion, mensaje = "La condición no se cumplió a tiempo") =>
  waitFor(() => {
    if (!condicion()) throw new Error(mensaje);
  });

// Los errores que React lanza a propósito en dev también llegan a window.onerror y Jasmine los marca como fallo.
// Esto los silencia solo mientras corre `fn`.
export function sinErrorGlobal(fn) {
  const previo = window.onerror;
  window.onerror = () => true;
  try {
    return fn();
  } finally {
    window.onerror = previo;
  }
}
