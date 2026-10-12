import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatearFechaHora, formatearPrecio } from "../utils/formato";
import BadgeEstadoOrden from "./BadgeEstadoOrden";

// Lista de órdenes. `enlace(orden)` devuelve la ruta del detalle; `mostrarCliente` agrega la columna de cliente.
export default function TablaOrdenes({ ordenes, enlace, mostrarCliente = false, vacio = "No hay órdenes para mostrar." }) {
  if (ordenes.length === 0) return <p className="text-center text-muted py-4">{vacio}</p>;
  return (
    <Table responsive hover className="align-middle bg-white">
      <thead>
        <tr>
          <th>Código</th>
          <th>Fecha</th>
          {mostrarCliente && <th>Cliente</th>}
          <th className="text-center">Unidades</th>
          <th className="text-end">Total</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {ordenes.map((orden) => (
          <tr key={orden.id}>
            <td className="fw-semibold">{orden.codigo}</td>
            <td>{formatearFechaHora(orden.creadoEn)}</td>
            {mostrarCliente && (
              <td>
                {orden.cliente.nombre} {orden.cliente.apellidos}
              </td>
            )}
            <td className="text-center">{orden.unidades}</td>
            <td className="text-end">{formatearPrecio(orden.total)}</td>
            <td>
              <BadgeEstadoOrden estado={orden.estado} />
            </td>
            <td className="text-end">
              <Button as={Link} to={enlace(orden)} size="sm" variant="outline-success">
                Ver
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
