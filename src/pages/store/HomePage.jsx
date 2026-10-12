import { useMemo } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import Cargando from "../../components/Cargando";
import CarruselDestacados from "../../components/CarruselDestacados";
import Hero from "../../components/Hero";
import ImagenSegura from "../../components/ImagenSegura";
import MensajeError from "../../components/MensajeError";
import { useCart } from "../../context/CartContext";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function HomePage() {
  const { agregar } = useCart();
  const productos = useApi(() => api.productos.listar({ destacado: true }), []);
  const categorias = useApi(() => api.categorias.listar(), []);
  const destacados = useMemo(() => productos.datos ?? [], [productos.datos]);

  return (
    <>
      <Hero
        titulo="Dino rancho"
        subtitulo="El lugar donde encontrarás la mascota prehistórica de tus sueños"
        imagen="img/babyspinos2.jpeg"
        alt="Baby Spinosaurus"
      >
        <Link to="/productos" className="btn-banner">
          Ver catálogo
        </Link>
      </Hero>

      {categorias.datos?.length > 0 && (
        <Container className="mb-4">
          <h2 className="titulo-seccion">Categorías</h2>
          <Row xs={1} sm={2} md={3} className="g-3">
            {categorias.datos.map((c) => (
              <Col key={c.id}>
                <Card as={Link} to={`/categorias/${c.id}`} className="h-100 text-decoration-none shadow-sm">
                  <ImagenSegura src={c.imagen} alt={c.nombre} className="card-img-top imagen-tarjeta" />
                  <Card.Body>
                    <Card.Title as="h5" className="text-dark">
                      {c.nombre}
                    </Card.Title>
                    <Card.Text className="text-muted small">{c.totalProductos} productos</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      <Container>
        <h1 className="titulo-seccion">Productos destacados</h1>
      </Container>

      {productos.cargando && <Cargando />}
      {productos.error && (
        <Container>
          <MensajeError error={productos.error} onReintentar={productos.recargar} />
        </Container>
      )}
      {!productos.cargando && !productos.error &&
        (destacados.length > 0 ? (
          <CarruselDestacados productos={destacados} onAgregar={agregar} />
        ) : (
          <p className="text-center text-muted py-4">Pronto tendremos productos destacados.</p>
        ))}
    </>
  );
}
