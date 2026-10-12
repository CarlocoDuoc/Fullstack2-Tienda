import { Alert, Button, Container } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { leerUltimaOrden } from "../../utils/boleta";
import { formatearPrecio } from "../../utils/formato";

export default function CompraErrorPage() {
  const orden = leerUltimaOrden();
  if (!orden || orden.estado === "Pagada") return <Navigate to="/carrito" replace />;

  return (
    <Container className="my-5" style={{ maxWidth: 640 }}>
      <Alert variant="danger">
        <h1 className="h4">No pudimos procesar tu pago</h1>
        <p>
          El pago de la orden <strong>{orden.codigo}</strong> por {formatearPrecio(orden.total)} fue rechazado. No se realizó ningún cobro y tu carrito
          sigue guardado.
        </p>
        <p className="mb-0">Puedes intentarlo nuevamente o revisar tu carrito.</p>
      </Alert>
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        <Button as={Link} to="/checkout" variant="success">
          Reintentar el pago
        </Button>
        <Button as={Link} to="/carrito" variant="outline-success">
          Volver al carrito
        </Button>
      </div>
    </Container>
  );
}
