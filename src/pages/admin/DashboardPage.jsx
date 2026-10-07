import { Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { productosDB, usuariosDB } from "../../data/db";
import { useColeccion } from "../../hooks/useColeccion";

function TarjetaResumen({ icono, titulo, valor, detalle }) {
  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body className="d-flex align-items-center gap-3">
        <i className={`bi ${icono} fs-1 text-success`}></i>
        <div>
          <div className="text-secondary">{titulo}</div>
          <div className="fs-3 fw-bold">{valor}</div>
          {detalle && <small className="text-muted">{detalle}</small>}
        </div>
      </Card.Body>
    </Card>
  );
}

function TarjetaAcceso({ icono, titulo, texto, verTexto, verRuta, nuevoTexto, nuevoRuta }) {
  return (
    <Card className="h-100 shadow-sm border-0 text-center p-3">
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <div className="fs-1 mb-3">{icono}</div>
          <Card.Title as="h3" className="fw-bold">
            {titulo}
          </Card.Title>
          <Card.Text className="text-secondary">{texto}</Card.Text>
        </div>
        <div className="d-grid gap-2 mt-4">
          <Link to={verRuta} className="btn btn-success fw-bold">
            {verTexto}
          </Link>
          <Link to={nuevoRuta} className="btn btn-outline-success fw-bold">
            {nuevoTexto}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function DashboardPage() {
  const productos = useColeccion(productosDB);
  const usuarios = useColeccion(usuariosDB);

  const destacados = productos.filter((p) => p.destacado).length;
  const administradores = usuarios.filter((u) => u.rol === "Administrador").length;
  const activos = usuarios.filter((u) => u.estado === "Activo").length;

  return (
    <>
      <div className="mb-4">
        <h1 className="fw-bold h2">Panel de Administración</h1>
        <p className="text-muted mb-0">
          Gestiona el inventario de productos y los usuarios registrados en Dino Rancho.
        </p>
      </div>

      <Row xs={1} md={3} className="g-3 mb-4">
        <Col>
          <TarjetaResumen
            icono="bi-box-seam"
            titulo="Productos"
            valor={productos.length}
            detalle={`${destacados} destacados en el Home`}
          />
        </Col>
        <Col>
          <TarjetaResumen
            icono="bi-people"
            titulo="Usuarios"
            valor={usuarios.length}
            detalle={`${activos} activos`}
          />
        </Col>
        <Col>
          <TarjetaResumen icono="bi-shield-check" titulo="Administradores" valor={administradores} />
        </Col>
      </Row>

      <Row xs={1} md={2} className="g-4">
        <Col>
          <TarjetaAcceso
            icono="🦖"
            titulo="Gestión de Productos"
            texto="Revisa el inventario, añade nuevos especímenes o artículos, y actualiza los datos existentes."
            verTexto="Ver catálogo"
            verRuta="/admin/productos"
            nuevoTexto="+ Nuevo producto"
            nuevoRuta="/admin/productos/nuevo"
          />
        </Col>
        <Col>
          <TarjetaAcceso
            icono="👤"
            titulo="Gestión de Usuarios"
            texto="Administra los usuarios registrados, crea nuevos perfiles administrativos o edita accesos."
            verTexto="Ver lista de usuarios"
            verRuta="/admin/usuarios"
            nuevoTexto="+ Nuevo usuario"
            nuevoRuta="/admin/usuarios/nuevo"
          />
        </Col>
      </Row>
    </>
  );
}
