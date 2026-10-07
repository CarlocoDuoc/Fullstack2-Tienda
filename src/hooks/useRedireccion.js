import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Navega a otra ruta después de un breve retardo (para alcanzar a mostrar un
// mensaje de éxito) y cancela el temporizador si el componente se desmonta.
export function useRedireccion(retardo = 1200) {
  const navigate = useNavigate();
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  return useCallback(
    (ruta) => {
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => navigate(ruta), retardo);
    },
    [navigate, retardo]
  );
}
