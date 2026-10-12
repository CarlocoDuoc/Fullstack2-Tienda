import { Container } from "react-bootstrap";
import Cargando from "../../components/Cargando";
import GrillaProductos from "../../components/GrillaProductos";
import MensajeError from "../../components/MensajeError";
import { useCart } from "../../context/CartContext";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function OfertasPage() {
  const { agregar } = useCart();
  const { datos, cargando, error, recargar } = useApi(() => api.productos.listar({ oferta: true }), []);
  return (
    <Container className="mb-5">
      <h1 className="titulo-seccion fw-bold my-3">Ofertas</h1>
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={recargar} />}
      {datos && <GrillaProductos productos={datos} onAgregar={agregar} vacio="Por ahora no hay ofertas. ¡Vuelve pronto!" />}
    </Container>
  );
}
