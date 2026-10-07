import { useMemo } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import TarjetaProducto from "../../components/TarjetaProducto";
import { productosDB } from "../../data/db";
import { useColeccion } from "../../hooks/useColeccion";
import { filtrarProductos } from "../../utils/busqueda";

export default function ProductosPage() {
  const productos = useColeccion(productosDB);
  const [parametros] = useSearchParams();
  const consulta = (parametros.get("q") ?? "").trim();

  const visibles = useMemo(() => filtrarProductos(productos, consulta), [productos, consulta]);

  return (
    <Container className="mb-5">
      <h1 className="titulo-seccion fw-bold my-3">Nuestros Productos</h1>

      {consulta && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <p className="mb-0">
            {visibles.length} resultado(s) para <strong>«{consulta}»</strong>
          </p>
          <Button as={Link} to="/productos" variant="outline-secondary" size="sm">
            Quitar filtro
          </Button>
        </div>
      )}

      {visibles.length === 0 ? (
        <p className="fs-5 text-muted text-center py-5">
          {consulta ? "No encontramos productos con esa búsqueda." : "No hay productos disponibles por el momento."}
        </p>
      ) : (
        <Row xs={1} sm={2} lg={4} className="g-4">
          {visibles.map((producto) => (
            <Col key={producto.id}>
              <TarjetaProducto producto={producto} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
