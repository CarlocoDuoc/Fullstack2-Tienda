import { Col, Row } from "react-bootstrap";
import TarjetaProducto from "./TarjetaProducto";

// Grilla responsive de tarjetas: 1 columna en móvil, 2 en tablet, 3-4 en escritorio.
export default function GrillaProductos({ productos, onAgregar, vacio = "No hay productos para mostrar." }) {
  if (productos.length === 0) return <p className="text-center text-muted py-4">{vacio}</p>;
  return (
    <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
      {productos.map((producto) => (
        <Col key={producto.id}>
          <TarjetaProducto producto={producto} onAgregar={onAgregar} />
        </Col>
      ))}
    </Row>
  );
}
