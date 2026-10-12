import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, borrarToken, EVENTO_SESION_EXPIRADA, guardarToken, obtenerToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // true mientras se comprueba el token guardado (evita redirigir al login por error al recargar)
  const [cargando, setCargando] = useState(() => Boolean(obtenerToken()));

  useEffect(() => {
    if (!obtenerToken()) return undefined;
    let activo = true;
    api.auth
      .me()
      .then(({ usuario: u }) => activo && setUsuario(u))
      .catch(() => activo && setUsuario(null))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const alExpirar = () => setUsuario(null);
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  const login = useCallback(async (usuario, password) => {
    try {
      const { token, usuario: u } = await api.auth.login({ usuario, password });
      guardarToken(token);
      setUsuario(u);
      return { ok: true, usuario: u };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  const actualizarUsuario = useCallback((u) => setUsuario(u), []);

  const value = useMemo(
    () => ({ usuario, cargando, login, logout, actualizarUsuario, esAdmin: usuario?.rol === "Administrador" }),
    [usuario, cargando, login, logout, actualizarUsuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return contexto;
}
