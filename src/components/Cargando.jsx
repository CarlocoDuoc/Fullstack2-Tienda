import { Spinner } from "react-bootstrap";

export default function Cargando({ texto = "Cargando..." }) {
  return (
    <div className="text-center text-muted py-5" role="status" aria-live="polite">
      <Spinner animation="border" variant="success" size="sm" className="me-2" />
      {texto}
    </div>
  );
}
