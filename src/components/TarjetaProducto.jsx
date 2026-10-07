import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formato";
import ImagenSegura from "./ImagenSegura";

export default function TarjetaProducto({ producto }) {
  const detalle = `/productos/${producto.id}`;

  return (
    <Card className="h-100 shadow-sm">
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
          {formatearPrecio(producto.precio)}
        </Card.Subtitle>
        <Card.Text>{producto.descripcion}</Card.Text>
        <Button as={Link} to={detalle} variant="primary" className="mt-auto">
          Ver detalle
        </Button>
      </Card.Body>
    </Card>
  );
}
