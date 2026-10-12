import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { carritoReducer, guardarCarrito, leerCarrito, totalCarrito, unidadesCarrito } from "../utils/carrito";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(carritoReducer, undefined, () => leerCarrito());
  // Aviso breve ("Agregado al carrito") que muestra <AvisoCarrito />
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    guardarCarrito(items);
  }, [items]);

  const agregar = useCallback((producto, cantidad = 1) => {
    if (!producto || producto.stock < 1) {
      setAviso({ id: Date.now(), tipo: "warning", mensaje: "Este producto está agotado." });
      return;
    }
    dispatch({ tipo: "agregar", producto, cantidad });
    setAviso({ id: Date.now(), tipo: "success", mensaje: `"${producto.nombre}" se agregó al carrito.` });
  }, []);

  const cambiarCantidad = useCallback((productoId, cantidad) => dispatch({ tipo: "cambiar", productoId, cantidad }), []);
  const quitar = useCallback((productoId) => dispatch({ tipo: "quitar", productoId }), []);
  const vaciar = useCallback(() => dispatch({ tipo: "vaciar" }), []);
  const cerrarAviso = useCallback(() => setAviso(null), []);

  const value = useMemo(
    () => ({
      items,
      total: totalCarrito(items),
      unidades: unidadesCarrito(items),
      aviso,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      cerrarAviso,
    }),
    [items, aviso, agregar, cambiarCantidad, quitar, vaciar, cerrarAviso]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return contexto;
}
