import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import BuscadorProductos from "./BuscadorProductos";

// "Contacto" lleva al pie de página, donde están los datos de contacto.
const irAContacto = () => {
  document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
};

export default function MenuPrincipal() {
  return (
    <Navbar expand="lg" variant="dark" className="navbar-color">
      <Container fluid>
        <Navbar.Toggle aria-controls="menu-principal" aria-label="Abrir menú" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros">
              Nosotros
            </Nav.Link>
            <Nav.Link as={NavLink} to="/productos">
              Productos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/blogs">
              Blogs
            </Nav.Link>
            <Nav.Link as="button" type="button" onClick={irAContacto}>
              Contacto
            </Nav.Link>
          </Nav>
          <BuscadorProductos />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
