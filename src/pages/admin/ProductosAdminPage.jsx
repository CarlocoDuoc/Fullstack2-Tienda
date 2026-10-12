import { useState } from "react";
import { Alert, Badge, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import Cargando from "../../components/Cargando";
import ImagenSegura from "../../components/ImagenSegura";
import MensajeError from "../../components/MensajeError";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { formatearPrecio } from "../../utils/formato";

// Tabla reutilizada por el listado de productos y por el de stock crítico.
export function TablaProductosAdmin({ productos, onEliminar }) {
  if (productos.length === 0) return <p className="text-center text-muted py-4">No hay productos para mostrar.</p>;
  return (
    <Table responsive hover className="align-middle bg-white">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Categoría</th>
          <th className="text-end">Precio</th>
          <th className="text-center">Stock</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p.id}>
            <td>
              <div className="d-flex align-items-center gap-2">
                <ImagenSegura src={p.imagen} alt="" className="miniatura" />
                <span className="fw-semibold">{p.nombre}</span>
                {p.destacado && <Badge bg="info">Destacado</Badge>}
              </div>
            </td>
            <td>{p.categoriaNombre ?? "—"}</td>
            <td className="text-end">
              {p.enOferta ? (
                <>
                  <span className="text-success fw-semibold">{formatearPrecio(p.precioOferta)}</span>
                  <br />
                  <del className="small text-muted">{formatearPrecio(p.precio)}</del>
                </>
              ) : (
                formatearPrecio(p.precio)
              )}
            </td>
            <td className="text-center">
              <Badge bg={p.stock === 0 ? "danger" : p.stock <= p.stockCritico ? "warning" : "success"} text={p.stock > 0 && p.stock <= p.stockCritico ? "dark" : undefined}>
                {p.stock}
              </Badge>
            </td>
            <td className="text-end text-nowrap">
              <Button as={Link} to={`/admin/productos/${p.id}/editar`} size="sm" variant="outline-primary" className="me-1">
                Editar
              </Button>
              <Button size="sm" variant="outline-danger" onClick={() => onEliminar(p)}>
                Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// Hook con la lógica de eliminar (modal + llamada a la API) compartida por ambas páginas.
export function useEliminarProducto(recargar) {
  const [objetivo, setObjetivo] = useState(null);
  const [error, setError] = useState(null);
  const confirmar = async () => {
    try {
      await api.productos.eliminar(objetivo.id);
      setObjetivo(null);
      setError(null);
      recargar();
    } catch (e) {
      setError(e.message);
      setObjetivo(null);
    }
  };
  const modal = (
    <ModalConfirmacion
      show={Boolean(objetivo)}
      titulo="Eliminar producto"
      mensaje={`¿Seguro que deseas eliminar "${objetivo?.nombre}"? Las boletas anteriores conservarán su nombre y precio.`}
      onCancelar={() => setObjetivo(null)}
      onConfirmar={confirmar}
    />
  );
  return { pedirEliminar: setObjetivo, modal, error };
}

export default function ProductosAdminPage() {
  const { datos, cargando, error, recargar } = useApi(() => api.productos.listar(), []);
  const eliminar = useEliminarProducto(recargar);
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Productos</h1>
        <div className="d-flex gap-2">
          <Button as={Link} to="/admin/productos/criticos" variant="outline-warning">
            Stock crítico
          </Button>
          <Button as={Link} to="/admin/productos/nuevo" variant="success">
            Nuevo producto
          </Button>
        </div>
      </div>
      {eliminar.error && <Alert variant="danger">{eliminar.error}</Alert>}
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={recargar} />}
      {datos && <TablaProductosAdmin productos={datos} onEliminar={eliminar.pedirEliminar} />}
      {eliminar.modal}
    </>
  );
}
