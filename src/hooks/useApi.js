import { useCallback, useEffect, useState } from "react";

// Carga datos desde la API y expone { datos, cargando, error, recargar, establecer }.
// `funcion` devuelve una promesa; `deps` son los valores que, al cambiar, repiten la carga.
export function useApi(funcion, deps = []) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;
    setEstado((anterior) => ({ ...anterior, cargando: true, error: null }));
    Promise.resolve()
      .then(funcion)
      .then((datos) => activo && setEstado({ datos, cargando: false, error: null }))
      .catch((error) => activo && setEstado({ datos: null, cargando: false, error }));
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const establecer = useCallback((datos) => setEstado((e) => ({ ...e, datos })), []);

  return { ...estado, recargar, establecer };
}
