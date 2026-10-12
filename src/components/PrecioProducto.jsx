import { Badge } from "react-bootstrap";
import { formatearPrecio } from "../utils/formato";
import { porcentajeDescuento } from "../utils/filtros";

// Muestra el precio; si hay oferta, tacha el precio normal y muestra el % de descuento.
export default function PrecioProducto({ producto, className = "" }) {
  if (!producto.enOferta) {
    return <span className={`fw-bold ${className}`}>{formatearPrecio(producto.precio)}</span>;
  }
  return (
    <span className={className}>
      <span className="fw-bold text-success me-2">{formatearPrecio(producto.precioOferta)}</span>
      <del className="text-muted small me-2">{formatearPrecio(producto.precio)}</del>
      <Badge bg="danger">-{porcentajeDescuento(producto)}%</Badge>
    </span>
  );
}
