import { Button, Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import BoletaView from "../../components/BoletaView";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function CuentaCompraDetallePage() {
  const { id } = useParams();
  const { datos, cargando, error, recargar } = useApi(() => api.ordenes.obtener(id), [id]);
  return (
    <Container className="my-4">
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={error.estado === 404 ? undefined : recargar} />}
      {datos && <BoletaView orden={datos} />}
      <div className="d-flex gap-2 justify-content-center mt-4 no-imprimir">
        <Button as={Link} to="/cuenta" variant="outline-success">
          Volver a mis compras
        </Button>
        {datos && (
          <Button variant="outline-dark" onClick={() => window.print()}>
            <i className="bi bi-printer me-2"></i>Imprimir
          </Button>
        )}
      </div>
    </Container>
  );
}
