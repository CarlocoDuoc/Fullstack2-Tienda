import { Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { TablaProductosAdmin, useEliminarProducto } from "./ProductosAdminPage";

export default function ProductosCriticosPage() {
  const { datos, cargando, error, recargar } = useApi(() => api.productos.criticos(), []);
  const eliminar = useEliminarProducto(recargar);
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Productos con stock crítico</h1>
        <Button as={Link} to="/admin/productos" variant="outline-success">
          Todos los productos
        </Button>
      </div>
      <p className="text-muted">Productos cuyo stock es igual o menor a su umbral crítico.</p>
      {eliminar.error && <Alert variant="danger">{eliminar.error}</Alert>}
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={recargar} />}
      {datos && <TablaProductosAdmin productos={datos} onEliminar={eliminar.pedirEliminar} />}
      {eliminar.modal}
    </>
  );
}
