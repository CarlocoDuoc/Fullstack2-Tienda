import { Alert, Button, Container } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import BoletaView from "../../components/BoletaView";
import { useAuth } from "../../context/AuthContext";
import { enlaceCorreoBoleta, leerUltimaOrden } from "../../utils/boleta";

export default function CompraExitosaPage() {
  const { usuario } = useAuth();
  const orden = leerUltimaOrden();
  if (!orden || orden.estado !== "Pagada") return <Navigate to="/" replace />;

  return (
    <Container className="my-4">
      <Alert variant="success" className="no-imprimir">
        <h1 className="h4">¡Gracias por tu compra, {orden.cliente.nombre}!</h1>
        <p className="mb-0">Tu pago fue aprobado. Guarda tu boleta {orden.codigo}.</p>
      </Alert>
      <BoletaView orden={orden} />
      <div className="d-flex flex-wrap gap-2 justify-content-center mt-4 no-imprimir">
        <Button variant="outline-dark" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i>Imprimir / guardar PDF
        </Button>
        <Button variant="outline-dark" href={enlaceCorreoBoleta(orden)}>
          <i className="bi bi-envelope me-2"></i>Enviar por correo
        </Button>
        {usuario && (
          <Button as={Link} to="/cuenta" variant="outline-success">
            Mis compras
          </Button>
        )}
        <Button as={Link} to="/productos" variant="success">
          Seguir comprando
        </Button>
      </div>
    </Container>
  );
}
