import { Badge, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import ImagenSegura from "./ImagenSegura";
import PrecioProducto from "./PrecioProducto";

export default function TarjetaProducto({ producto, onAgregar }) {
  const detalle = `/productos/${producto.id}`;
  const agotado = producto.stock < 1;

  return (
    <Card className="h-100 shadow-sm position-relative">
      {producto.enOferta && (
        <Badge bg="danger" className="position-absolute top-0 start-0 m-2">
          Oferta
        </Badge>
      )}
      <Link to={detalle}>
        <ImagenSegura src={producto.imagen} alt={producto.nombre} className="card-img-top imagen-tarjeta" />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h5">
          <Link to={detalle} className="text-decoration-none text-dark">
            {producto.nombre}
          </Link>
        </Card.Title>
        <Card.Subtitle as="h6" className="mb-2">
          <PrecioProducto producto={producto} />
        </Card.Subtitle>
        <Card.Text>{producto.descripcion}</Card.Text>
        {agotado && <p className="text-danger small fw-semibold">Agotado</p>}
        <div className="mt-auto d-grid gap-2">
          <Button as={Link} to={detalle} variant="outline-success">
            Ver detalle
          </Button>
          {onAgregar && (
            <Button variant="success" disabled={agotado} onClick={() => onAgregar(producto)}>
              <i className="bi bi-cart-plus me-2"></i>
              {agotado ? "Sin stock" : "Agregar al carrito"}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
