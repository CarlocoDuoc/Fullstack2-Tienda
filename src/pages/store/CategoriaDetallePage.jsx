import { Button, Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Cargando from "../../components/Cargando";
import GrillaProductos from "../../components/GrillaProductos";
import MensajeError from "../../components/MensajeError";
import { useCart } from "../../context/CartContext";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function CategoriaDetallePage() {
  const { id } = useParams();
  const { agregar } = useCart();
  const categoria = useApi(() => api.categorias.obtener(id), [id]);
  const productos = useApi(() => api.productos.listar({ categoria: id }), [id]);

  if (categoria.cargando) return <Cargando />;
  if (categoria.error) {
    return (
      <Container className="my-4">
        <MensajeError error={categoria.error} />
        <Button as={Link} to="/categorias" variant="outline-success">
          Ver todas las categorías
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mb-5">
      <h1 className="titulo-seccion fw-bold my-3">{categoria.datos.nombre}</h1>
      <p className="text-muted">{categoria.datos.descripcion}</p>
      {productos.cargando && <Cargando />}
      {productos.error && <MensajeError error={productos.error} onReintentar={productos.recargar} />}
      {productos.datos && <GrillaProductos productos={productos.datos} onAgregar={agregar} vacio="Esta categoría aún no tiene productos." />}
    </Container>
  );
}
