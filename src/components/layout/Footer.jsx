import { Col, Container, Row } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5" id="contacto">
      <Container className="text-center text-md-start">
        <Row>
          <Col md={4} className="mt-3">
            <h5 className="text-uppercase mb-4 fw-bold text-success">Dino Rancho</h5>
            <p className="text-light">
              El lugar donde encontrarás la mascota prehistórica de tus sueños. Calidad, cuidado responsable y la
              mejor atención en el rancho.
            </p>
          </Col>

          <Col md={4} className="mt-3">
            <h5 className="text-uppercase mb-4 fw-bold text-success">Contáctanos</h5>
            <p className="text-light">
              <i className="bi bi-geo-alt-fill me-2 text-success"></i> Av. Jurásica #123, Santiago
            </p>
            <p className="text-light">
              <i className="bi bi-envelope-fill me-2 text-success"></i> contacto@dinorancho.cl
            </p>
            <p className="text-light">
              <i className="bi bi-telephone-fill me-2 text-success"></i> +56 9 1234 5678
            </p>
          </Col>

          <Col md={4} className="mt-3">
            <h5 className="text-uppercase mb-4 fw-bold text-success">Síguenos</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#contacto" className="text-light text-decoration-none">
                  <i className="bi bi-facebook me-2 text-primary"></i> Facebook
                </a>
              </li>
              <li className="mb-2">
                <a href="#contacto" className="text-light text-decoration-none">
                  <i className="bi bi-instagram me-2 text-danger"></i> Instagram
                </a>
              </li>
              <li className="mb-2">
                <a href="#contacto" className="text-light text-decoration-none">
                  <i className="bi bi-tiktok me-2 text-info"></i> TikTok
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
