import { Alert, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { formatearPrecio } from "../../utils/formato";

function Tarjeta({ titulo, valor, icono, a, variante = "success" }) {
  return (
    <Col xs={6} lg={3}>
      <Card as={Link} to={a} className="h-100 shadow-sm text-decoration-none">
        <Card.Body>
          <i className={`bi bi-${icono} fs-3 text-${variante}`}></i>
          <div className="fs-3 fw-bold text-dark">{valor}</div>
          <div className="text-muted">{titulo}</div>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default function DashboardPage() {
  const { datos: r, cargando, error, recargar } = useApi(() => api.admin.resumen(), []);
  if (cargando) return <Cargando />;
  if (error) return <MensajeError error={error} onReintentar={recargar} />;

  return (
    <>
      <h1 className="h3 mb-3">Dashboard</h1>
      {r.productosCriticos > 0 && (
        <Alert variant="warning">
          Hay <strong>{r.productosCriticos}</strong> producto(s) con stock crítico. <Link to="/admin/productos/criticos">Revisarlos</Link>
        </Alert>
      )}
      <Row className="g-3">
        <Tarjeta titulo="Ingresos (órdenes pagadas)" valor={formatearPrecio(r.ingresos)} icono="cash-coin" a="/admin/reportes" />
        <Tarjeta titulo="Órdenes pagadas" valor={r.ordenesPagadas} icono="receipt" a="/admin/ordenes" />
        <Tarjeta titulo="Pagos fallidos" valor={r.ordenesFallidas} icono="x-octagon" a="/admin/ordenes" variante="danger" />
        <Tarjeta titulo="Productos" valor={r.productos} icono="box-seam" a="/admin/productos" />
        <Tarjeta titulo="Stock crítico" valor={r.productosCriticos} icono="exclamation-triangle" a="/admin/productos/criticos" variante="warning" />
        <Tarjeta titulo="Categorías" valor={r.categorias} icono="tags" a="/admin/categorias" />
        <Tarjeta titulo="Usuarios" valor={r.usuarios} icono="people" a="/admin/usuarios" />
        <Tarjeta titulo="Mensajes" valor={r.mensajes} icono="envelope" a="/admin/mensajes" />
      </Row>
    </>
  );
}
