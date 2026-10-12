import { Alert, Button } from "react-bootstrap";

// Muestra un error de carga con botón para reintentar.
export default function MensajeError({ error, onReintentar }) {
  const mensaje = typeof error === "string" ? error : error?.message ?? "No se pudo cargar la información.";
  return (
    <Alert variant="danger" className="my-4" role="alert">
      <p className="mb-2">{mensaje}</p>
      {onReintentar && (
        <Button variant="outline-danger" size="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </Alert>
  );
}
