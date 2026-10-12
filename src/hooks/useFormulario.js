import { useCallback, useMemo, useState } from "react";

// Maneja los valores de un formulario y valida en tiempo real.
// `validar(valores)` debe devolver { campo: "mensaje" } con "" cuando el campo es válido.
// Los errores que devuelve el servidor (fijarErroresServidor) se muestran hasta que el campo cambie.
export function useFormulario(valoresIniciales, validar) {
  const [valores, setValores] = useState(valoresIniciales);
  const [tocados, setTocados] = useState({});
  const [erroresServidor, setErroresServidor] = useState({});

  const erroresLocales = useMemo(() => validar(valores), [validar, valores]);
  const errores = useMemo(() => {
    const combinados = { ...erroresLocales };
    for (const [campo, mensaje] of Object.entries(erroresServidor)) {
      if (!combinados[campo]) combinados[campo] = mensaje;
    }
    return combinados;
  }, [erroresLocales, erroresServidor]);

  const cambiar = useCallback((evento) => {
    const { name, type, value, checked } = evento.target;
    setValores((anteriores) => ({ ...anteriores, [name]: type === "checkbox" ? checked : value }));
    setTocados((anteriores) => ({ ...anteriores, [name]: true }));
    setErroresServidor((anteriores) => {
      if (!anteriores[name]) return anteriores;
      const { [name]: _quitado, ...resto } = anteriores;
      return resto;
    });
  }, []);

  const establecer = useCallback((parcial) => {
    setValores((anteriores) => ({ ...anteriores, ...parcial }));
  }, []);

  const tocarTodo = useCallback(() => {
    setTocados(Object.fromEntries(Object.keys(valoresIniciales).map((campo) => [campo, true])));
  }, [valoresIniciales]);

  const fijarErroresServidor = useCallback((campos) => {
    setErroresServidor(campos ?? {});
    if (campos) setTocados((anteriores) => ({ ...anteriores, ...Object.fromEntries(Object.keys(campos).map((c) => [c, true])) }));
  }, []);

  const esValido = !Object.values(errores).some(Boolean);

  return { valores, errores, tocados, cambiar, establecer, tocarTodo, fijarErroresServidor, esValido };
}
