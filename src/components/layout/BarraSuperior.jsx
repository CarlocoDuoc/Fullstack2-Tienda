import { Button, Container, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Franja superior: marca a la izquierda, acciones de sesión a la derecha.
export default function BarraSuperior() {
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar>
      <Container fluid className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          Dino Rancho
        </Navbar.Brand>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {usuario ? (
            <>
              <span className="text-secondary d-none d-sm-inline">Hola, {usuario.nombre}</span>
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
              <Button as={Link} to="/login" variant="outline-success">
                Iniciar Sesión
              </Button>
              <Button as={Link} to="/registro" variant="success">
                Registrarse
              </Button>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
}
