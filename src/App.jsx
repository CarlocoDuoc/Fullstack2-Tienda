import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./components/layout/AdminLayout";
import StoreLayout from "./components/layout/StoreLayout";

import BlogDetallePage from "./pages/store/BlogDetallePage";
import BlogsPage from "./pages/store/BlogsPage";
import HomePage from "./pages/store/HomePage";
import LoginPage from "./pages/store/LoginPage";
import NosotrosPage from "./pages/store/NosotrosPage";
import NotFoundPage from "./pages/store/NotFoundPage";
import ProductoDetallePage from "./pages/store/ProductoDetallePage";
import ProductosPage from "./pages/store/ProductosPage";
import RegistroPage from "./pages/store/RegistroPage";

import DashboardPage from "./pages/admin/DashboardPage";
import ProductoFormPage from "./pages/admin/ProductoFormPage";
import ProductosAdminPage from "./pages/admin/ProductosAdminPage";
import UsuarioFormPage from "./pages/admin/UsuarioFormPage";
import UsuariosAdminPage from "./pages/admin/UsuariosAdminPage";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Tienda (pública) */}
        <Route element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="productos/:id" element={<ProductoDetallePage />} />
          <Route path="nosotros" element={<NosotrosPage />} />
          <Route path="blogs" element={<BlogsPage />} />
          <Route path="blogs/:id" element={<BlogDetallePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegistroPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Administración (solo rol Administrador) */}
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={["Administrador"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="productos" element={<ProductosAdminPage />} />
          <Route path="productos/nuevo" element={<ProductoFormPage />} />
          <Route path="productos/:id/editar" element={<ProductoFormPage />} />
          <Route path="usuarios" element={<UsuariosAdminPage />} />
          <Route path="usuarios/nuevo" element={<UsuarioFormPage />} />
          <Route path="usuarios/:id/editar" element={<UsuarioFormPage />} />
        </Route>
      </Routes>
    </>
  );
}
