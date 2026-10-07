import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protege rutas: sin sesión redirige al login; con un rol no permitido, al inicio.
export default function ProtectedRoute({ roles, children }) {
  const { usuario } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return children;
}
