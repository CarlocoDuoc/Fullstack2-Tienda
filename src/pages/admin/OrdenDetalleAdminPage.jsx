import { Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import BoletaView from "../../components/BoletaView";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function OrdenDetalleAdminPage() {
  const { id } = useParams();
  const { datos, cargando, error, recargar } = useApi(() => api.ordenes.obtener(id), [id]);
  return (
    <>
      <div className="d-flex gap-2 mb-3 no-imprimir">
        <Button as={Link} to="/admin/ordenes" variant="outline-success" size="sm">
          Volver a órdenes
        </Button>
        {datos && (
          <Button variant="outline-dark" size="sm" onClick={() => window.print()}>
            <i className="bi bi-printer me-2"></i>Imprimir
          </Button>
        )}
      </div>
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={error.estado === 404 ? undefined : recargar} />}
      {datos && <BoletaView orden={datos} />}
    </>
  );
}
