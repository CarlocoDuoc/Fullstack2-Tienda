import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import BuscadorProductos from "./BuscadorProductos";

export default function MenuPrincipal() {
  const { datos: categorias } = useApi(() => api.categorias.listar(), []);
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" variant="dark" className="navbar-color no-imprimir">
      <Container fluid>
        <Navbar.Toggle aria-controls="menu-principal" aria-label="Abrir menú" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/productos" end>
              Productos
            </Nav.Link>
            <NavDropdown title="Categorías" id="menu-categorias">
              <NavDropdown.Item onClick={() => navigate("/categorias")}>Todas las categorías</NavDropdown.Item>
              {categorias?.length > 0 && <NavDropdown.Divider />}
              {categorias?.map((c) => (
                <NavDropdown.Item key={c.id} onClick={() => navigate(`/categorias/${c.id}`)}>
                  {c.nombre}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <Nav.Link as={NavLink} to="/ofertas">
              Ofertas
            </Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros">
              Nosotros
            </Nav.Link>
            <Nav.Link as={NavLink} to="/blogs">
              Blogs
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">
              Contacto
            </Nav.Link>
          </Nav>
          <BuscadorProductos />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
