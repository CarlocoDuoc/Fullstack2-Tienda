import { Outlet } from "react-router-dom";
import BarraSuperior from "./BarraSuperior";
import Footer from "./Footer";
import MenuPrincipal from "./MenuPrincipal";

// Estructura común de todas las páginas públicas de la tienda.
export default function StoreLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <header>
        <BarraSuperior />
        <MenuPrincipal />
      </header>
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
