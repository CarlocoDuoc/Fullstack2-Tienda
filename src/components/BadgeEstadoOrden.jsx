import { Badge } from "react-bootstrap";

export default function BadgeEstadoOrden({ estado }) {
  return <Badge bg={estado === "Pagada" ? "success" : "danger"}>{estado}</Badge>;
}
