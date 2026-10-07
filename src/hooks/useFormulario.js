import { useCallback, useMemo, useState } from "react";

// Maneja los valores de un formulario y valida en tiempo real.
// `validar(valores)` debe devolver { campo: "mensaje" } con "" cuando el campo es válido.
export function useFormulario(valoresIniciales, validar) {
  const [valores, setValores] = useState(valoresIniciales);
  const [tocados, setTocados] = useState({});

  const errores = useMemo(() => validar(valores), [validar, valores]);

  const cambiar = useCallback((evento) => {
    const { name, type, value, checked } = evento.target;
    setValores((anteriores) => ({ ...anteriores, [name]: type === "checkbox" ? checked : value }));
    setTocados((anteriores) => ({ ...anteriores, [name]: true }));
  }, []);

  const tocarTodo = useCallback(() => {
    setTocados(Object.fromEntries(Object.keys(valoresIniciales).map((campo) => [campo, true])));
  }, [valoresIniciales]);

  const esValido = !Object.values(errores).some(Boolean);

  return { valores, errores, tocados, cambiar, tocarTodo, esValido };
}
