import { Card, Col, ProgressBar, Row, Table } from "react-bootstrap";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { formatearFecha, formatearPrecio } from "../../utils/formato";

export default function ReportesPage() {
  const { datos, cargando, error, recargar } = useApi(() => api.admin.reportes(), []);
  if (cargando) return <Cargando />;
  if (error) return <MensajeError error={error} onReintentar={recargar} />;

  const { resumen, ventasPorDia, topProductos, ventasPorCategoria } = datos;
  const maxDia = Math.max(1, ...ventasPorDia.map((d) => d.total));
  const maxCategoria = Math.max(1, ...ventasPorCategoria.map((c) => c.ingresos));

  return (
    <>
      <h1 className="h3 mb-3">Reportes de ventas</h1>
      <Row className="g-3 mb-4">
        {[
          ["Ingresos", formatearPrecio(resumen.ingresos)],
          ["Órdenes pagadas", resumen.ordenes],
          ["Ticket promedio", formatearPrecio(resumen.ticketPromedio)],
        ].map(([titulo, valor]) => (
          <Col key={titulo} sm={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="text-muted">{titulo}</div>
                <div className="fs-3 fw-bold">{valor}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="h5">Ventas de los últimos 14 días</h2>
              {ventasPorDia.map((d) => (
                <div key={d.fecha} className="d-flex align-items-center gap-2 mb-1">
                  <small className="text-muted" style={{ width: 80 }}>
                    {formatearFecha(d.fecha).slice(0, 5)}
                  </small>
                  <ProgressBar className="flex-grow-1" variant="success" now={(d.total / maxDia) * 100} aria-label={`Ventas del ${formatearFecha(d.fecha)}`} />
                  <small style={{ width: 90 }} className="text-end">
                    {formatearPrecio(d.total)}
                  </small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="h5">Ingresos por categoría</h2>
              {ventasPorCategoria.length === 0 && <p className="text-muted mb-0">Aún no hay ventas.</p>}
              {ventasPorCategoria.map((c) => (
                <div key={c.categoria} className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <span>{c.categoria}</span>
                    <span>{formatearPrecio(c.ingresos)}</span>
                  </div>
                  <ProgressBar variant="info" now={(c.ingresos / maxCategoria) * 100} aria-label={`Ingresos de ${c.categoria}`} />
                </div>
              ))}
            </Card.Body>
          </Card>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="h5">Productos más vendidos</h2>
              <Table size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-end">Unid.</th>
                    <th className="text-end">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductos.map((p) => (
                    <tr key={p.nombre}>
                      <td>{p.nombre}</td>
                      <td className="text-end">{p.unidades}</td>
                      <td className="text-end">{formatearPrecio(p.ingresos)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
