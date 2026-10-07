import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import Hero from "../../components/Hero";

const razones = [
  {
    titulo: "Crianza Responsable",
    texto: "Nuestros ejemplares crecen en hábitats controlados y adaptados a las necesidades de cada especie.",
  },
  {
    titulo: "Asesorías",
    texto: "Contamos con profesionales especializados para informarte sobre tu nueva mascota.",
  },
  {
    titulo: "Envíos Seguros",
    texto: "Garantizamos el traslado cómodo y seguro de las crías directamente a tu recinto o propiedad.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <Hero titulo="SOBRE NOSOTROS" imagen="img/dinorancho2.jpeg" alt="Imagen sobre nosotros">
        <p>
          En Dino Rancho nos dedicamos a la crianza, cuidado y preservación de especies prehistóricas con los más
          altos estándares de calidad y compromiso.
        </p>
        <Link to="/productos" className="btn-banner">
          Ver productos
        </Link>
      </Hero>

      <Container className="my-5">
        <h1 className="titulo-seccion fw-bold">¿Por qué elegir Dino Rancho?</h1>
        <Row xs={1} md={3} className="g-3">
          {razones.map((razon) => (
            <Col key={razon.titulo}>
              <Card className="h-100 p-3">
                <Card.Body className="text-center">
                  <Card.Title as="h5" className="fw-bold">
                    {razon.titulo}
                  </Card.Title>
                  <Card.Text>{razon.texto}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
