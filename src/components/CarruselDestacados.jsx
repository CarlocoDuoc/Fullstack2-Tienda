import { Carousel, Col, Container, Row } from "react-bootstrap";
import { dividirEnGrupos } from "../utils/busqueda";
import TarjetaProducto from "./TarjetaProducto";

// Muestra los productos en un carrusel, de a 3 por diapositiva (1 por fila en móvil).
export default function CarruselDestacados({ productos }) {
  const grupos = dividirEnGrupos(productos, 3);
  const variasDiapositivas = grupos.length > 1;

  return (
    <Carousel variant="dark" interval={null} controls={variasDiapositivas} indicators={variasDiapositivas}>
      {grupos.map((grupo, indice) => (
        <Carousel.Item key={indice}>
          <Container className="card_container">
            <Row xs={1} md={3} className="g-4 pb-5 justify-content-center">
              {grupo.map((producto) => (
                <Col key={producto.id}>
                  <TarjetaProducto producto={producto} />
                </Col>
              ))}
            </Row>
          </Container>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
