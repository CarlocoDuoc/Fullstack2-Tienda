import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./components/layout/AdminLayout";
import StoreLayout from "./components/layout/StoreLayout";

import BlogDetallePage from "./pages/store/BlogDetallePage";
import BlogsPage from "./pages/store/BlogsPage";
import CarritoPage from "./pages/store/CarritoPage";
import CategoriaDetallePage from "./pages/store/CategoriaDetallePage";
import CategoriasPage from "./pages/store/CategoriasPage";
import CheckoutPage from "./pages/store/CheckoutPage";
import CompraErrorPage from "./pages/store/CompraErrorPage";
import CompraExitosaPage from "./pages/store/CompraExitosaPage";
import ContactoPage from "./pages/store/ContactoPage";
import CuentaCompraDetallePage from "./pages/store/CuentaCompraDetallePage";
import CuentaPage from "./pages/store/CuentaPage";
import HomePage from "./pages/store/HomePage";
import LoginPage from "./pages/store/LoginPage";
import NosotrosPage from "./pages/store/NosotrosPage";
import NotFoundPage from "./pages/store/NotFoundPage";
import OfertasPage from "./pages/store/OfertasPage";
import ProductoDetallePage from "./pages/store/ProductoDetallePage";
import ProductosPage from "./pages/store/ProductosPage";
import RegistroPage from "./pages/store/RegistroPage";

import CategoriaFormPage from "./pages/admin/CategoriaFormPage";
import CategoriasAdminPage from "./pages/admin/CategoriasAdminPage";
import DashboardPage from "./pages/admin/DashboardPage";
import MensajesAdminPage from "./pages/admin/MensajesAdminPage";
import OrdenDetalleAdminPage from "./pages/admin/OrdenDetalleAdminPage";
import OrdenesAdminPage from "./pages/admin/OrdenesAdminPage";
import PerfilAdminPage from "./pages/admin/PerfilAdminPage";
import ProductoFormPage from "./pages/admin/ProductoFormPage";
import ProductosAdminPage from "./pages/admin/ProductosAdminPage";
import ProductosCriticosPage from "./pages/admin/ProductosCriticosPage";
import ReportesPage from "./pages/admin/ReportesPage";
import UsuarioFormPage from "./pages/admin/UsuarioFormPage";
import UsuarioHistorialPage from "./pages/admin/UsuarioHistorialPage";
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
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="categorias/:id" element={<CategoriaDetallePage />} />
          <Route path="ofertas" element={<OfertasPage />} />
          <Route path="nosotros" element={<NosotrosPage />} />
          <Route path="blogs" element={<BlogsPage />} />
          <Route path="blogs/:id" element={<BlogDetallePage />} />
          <Route path="contacto" element={<ContactoPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegistroPage />} />
          <Route path="carrito" element={<CarritoPage />} />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="compra/exitosa" element={<CompraExitosaPage />} />
          <Route path="compra/error" element={<CompraErrorPage />} />
          <Route
            path="cuenta"
            element={
              <ProtectedRoute>
                <CuentaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="cuenta/compras/:id"
            element={
              <ProtectedRoute>
                <CuentaCompraDetallePage />
              </ProtectedRoute>
            }
          />
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
          <Route path="ordenes" element={<OrdenesAdminPage />} />
          <Route path="ordenes/:id" element={<OrdenDetalleAdminPage />} />
          <Route path="productos" element={<ProductosAdminPage />} />
          <Route path="productos/criticos" element={<ProductosCriticosPage />} />
          <Route path="productos/nuevo" element={<ProductoFormPage />} />
          <Route path="productos/:id/editar" element={<ProductoFormPage />} />
          <Route path="categorias" element={<CategoriasAdminPage />} />
          <Route path="categorias/nueva" element={<CategoriaFormPage />} />
          <Route path="categorias/:id/editar" element={<CategoriaFormPage />} />
          <Route path="usuarios" element={<UsuariosAdminPage />} />
          <Route path="usuarios/nuevo" element={<UsuarioFormPage />} />
          <Route path="usuarios/:id/editar" element={<UsuarioFormPage />} />
          <Route path="usuarios/:id/compras" element={<UsuarioHistorialPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="mensajes" element={<MensajesAdminPage />} />
          <Route path="perfil" element={<PerfilAdminPage />} />
        </Route>
      </Routes>
    </>
  );
}
