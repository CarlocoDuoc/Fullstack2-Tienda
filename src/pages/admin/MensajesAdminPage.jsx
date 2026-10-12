import { Accordion } from "react-bootstrap";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { formatearFechaHora } from "../../utils/formato";

export default function MensajesAdminPage() {
  const { datos, cargando, error, recargar } = useApi(() => api.admin.mensajes(), []);
  return (
    <>
      <h1 className="h3 mb-3">Mensajes de contacto</h1>
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={recargar} />}
      {datos?.length === 0 && <p className="text-muted">Aún no hay mensajes.</p>}
      {datos?.length > 0 && (
        <Accordion>
          {datos.map((m) => (
            <Accordion.Item eventKey={String(m.id)} key={m.id}>
              <Accordion.Header>
                <span className="fw-semibold me-2">{m.asunto}</span>
                <small className="text-muted">
                  {m.nombre} · {formatearFechaHora(m.creadoEn)}
                </small>
              </Accordion.Header>
              <Accordion.Body>
                <p className="text-muted small">
                  De: {m.nombre} &lt;<a href={`mailto:${m.correo}`}>{m.correo}</a>&gt;
                </p>
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {m.mensaje}
                </p>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </>
  );
}
