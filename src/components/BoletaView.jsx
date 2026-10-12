import { Table } from "react-bootstrap";
import { formatearFechaHora, formatearPrecio } from "../utils/formato";
import BadgeEstadoOrden from "./BadgeEstadoOrden";

// Boleta de una orden: sirve para la pantalla de éxito, el historial y el panel admin. Se imprime con Ctrl+P.
export default function BoletaView({ orden }) {
  const { cliente, direccion } = orden;
  return (
    <article className="boleta border rounded p-3 p-md-4 bg-white" aria-label={`Boleta ${orden.codigo}`}>
      <header className="d-flex flex-wrap justify-content-between gap-2 mb-3">
        <div>
          <h2 className="h4 mb-0">Dino Rancho</h2>
          <small className="text-muted">Boleta electrónica</small>
        </div>
        <div className="text-md-end">
          <div className="fw-bold">{orden.codigo}</div>
          <small className="text-muted d-block">{formatearFechaHora(orden.creadoEn)}</small>
          <BadgeEstadoOrden estado={orden.estado} />
        </div>
      </header>

      <section className="mb-3">
        <h3 className="h6 text-uppercase text-muted">Cliente</h3>
        <p className="mb-1">
          {cliente.nombre} {cliente.apellidos} · {cliente.correo}
        </p>
        <p className="mb-0">
          {direccion.calle}
          {direccion.departamento ? `, ${direccion.departamento}` : ""} — {direccion.comuna}, {direccion.region}
        </p>
        {direccion.indicaciones && <p className="mb-0 text-muted small">Indicaciones: {direccion.indicaciones}</p>}
      </section>

      <Table responsive size="sm" className="align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th className="text-end">Precio</th>
            <th className="text-center">Cant.</th>
            <th className="text-end">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {orden.items.map((item, i) => (
            <tr key={`${item.productoId}-${i}`}>
              <td>{item.nombre}</td>
              <td className="text-end">{formatearPrecio(item.precioUnitario)}</td>
              <td className="text-center">{item.cantidad}</td>
              <td className="text-end">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={3} className="text-end">
              Total
            </th>
            <th className="text-end fs-5">{formatearPrecio(orden.total)}</th>
          </tr>
        </tfoot>
      </Table>
    </article>
  );
}
