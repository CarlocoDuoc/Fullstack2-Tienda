import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { autenticar, cerrarSesion, obtenerSesion } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obtenerSesion());

  const login = useCallback((correo, password) => {
    const resultado = autenticar(correo, password);
    if (resultado.ok) setUsuario(resultado.usuario);
    return resultado;
  }, []);

  const logout = useCallback(() => {
    cerrarSesion();
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({ usuario, login, logout, esAdmin: usuario?.rol === "Administrador" }),
    [usuario, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return contexto;
}
