import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Container className="text-center py-5">
      <h1 className="display-4 fw-bold">404</h1>
      <p className="fs-5">No encontramos la página que buscas.</p>
      <Button as={Link} to="/" variant="success">
        Volver al inicio
      </Button>
    </Container>
  );
}
