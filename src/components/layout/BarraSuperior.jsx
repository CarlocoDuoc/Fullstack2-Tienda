import { Badge, Button, Container, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

// Franja superior: marca a la izquierda; carrito y acciones de sesión a la derecha.
export default function BarraSuperior() {
  const { usuario, esAdmin, logout } = useAuth();
  const { unidades } = useCart();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar className="no-imprimir">
      <Container fluid className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          Dino Rancho
        </Navbar.Brand>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button as={Link} to="/carrito" variant="outline-dark" size="sm" aria-label={`Carrito, ${unidades} productos`}>
            <i className="bi bi-cart3 me-1"></i>
            Carrito{" "}
            <Badge bg="success" pill>
              {unidades}
            </Badge>
          </Button>
          {usuario ? (
            <>
              <Button as={Link} to="/cuenta" variant="link" size="sm" className="text-secondary d-none d-sm-inline">
                Hola, {usuario.nombre}
              </Button>
              {esAdmin && (
                <Button as={Link} to="/admin" variant="outline-dark" size="sm">
                  Panel admin
                </Button>
              )}
              <Button variant="outline-success" size="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="outline-success" size="sm">
                Iniciar Sesión
              </Button>
              <Button as={Link} to="/registro" variant="success" size="sm">
                Registrarse
              </Button>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
}
