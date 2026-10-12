import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import Cargando from "../../components/Cargando";
import ImagenSegura from "../../components/ImagenSegura";
import MensajeError from "../../components/MensajeError";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function CategoriasPage() {
  const { datos, cargando, error, recargar } = useApi(() => api.categorias.listar(), []);
  return (
    <Container className="mb-5">
      <h1 className="titulo-seccion fw-bold my-3">Categorías</h1>
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={recargar} />}
      <Row xs={1} sm={2} lg={3} className="g-4">
        {datos?.map((c) => (
          <Col key={c.id}>
            <Card as={Link} to={`/categorias/${c.id}`} className="h-100 text-decoration-none shadow-sm">
              <ImagenSegura src={c.imagen} alt={c.nombre} className="card-img-top imagen-tarjeta" />
              <Card.Body>
                <Card.Title as="h2" className="h5 text-dark">
                  {c.nombre}
                </Card.Title>
                <Card.Text className="text-muted">{c.descripcion}</Card.Text>
                <small className="text-success">{c.totalProductos} productos</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
