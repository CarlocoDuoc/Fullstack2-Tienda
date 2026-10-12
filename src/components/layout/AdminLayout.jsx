import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ENLACES = [
  { ruta: "/admin", icono: "speedometer2", texto: "Dashboard", fin: true },
  { ruta: "/admin/ordenes", icono: "receipt", texto: "Órdenes" },
  { ruta: "/admin/productos", icono: "box-seam", texto: "Productos" },
  { ruta: "/admin/categorias", icono: "tags", texto: "Categorías" },
  { ruta: "/admin/usuarios", icono: "people", texto: "Usuarios" },
  { ruta: "/admin/reportes", icono: "bar-chart", texto: "Reportes" },
  { ruta: "/admin/mensajes", icono: "envelope", texto: "Mensajes" },
  { ruta: "/admin/perfil", icono: "person-gear", texto: "Perfil" },
];

// Panel de administración: menú vertical en escritorio, en fila en móvil.
export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar bg="white" className="border-bottom no-imprimir">
        <Container fluid className="d-flex justify-content-between align-items-center">
          <Navbar.Brand as={Link} to="/admin" className="fw-bold">
            Dino Rancho <span className="badge bg-dark fs-6 ms-2">ADMIN</span>
          </Navbar.Brand>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="text-secondary d-none d-md-inline">{usuario?.nombre}</span>
            <Button as={Link} to="/" variant="outline-dark" size="sm">
              Volver a la tienda
            </Button>
            <Button variant="outline-success" size="sm" onClick={cerrarSesion}>
              Cerrar sesión
            </Button>
          </div>
        </Container>
      </Navbar>

      <Container fluid className="py-4">
        <Row className="g-4">
          <Col lg={2} className="no-imprimir">
            <Nav variant="pills" className="admin-menu flex-row flex-lg-column flex-wrap gap-1" as="nav" aria-label="Menú de administración">
              {ENLACES.map((e) => (
                <Nav.Link key={e.ruta} as={NavLink} to={e.ruta} end={e.fin}>
                  <i className={`bi bi-${e.icono} me-2`}></i>
                  {e.texto}
                </Nav.Link>
              ))}
            </Nav>
          </Col>
          <Col lg={10}>
            <main>
              <Outlet />
            </main>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
