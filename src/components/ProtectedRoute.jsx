import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Cargando from "./Cargando";

// Protege rutas: sin sesión redirige al login; con un rol no permitido, al inicio.
export default function ProtectedRoute({ roles, children }) {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) return <Cargando texto="Verificando sesión..." />;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return children;
}
