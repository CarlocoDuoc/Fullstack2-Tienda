import { useState } from "react";
import { Form } from "react-bootstrap";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import TablaOrdenes from "../../components/TablaOrdenes";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function OrdenesAdminPage() {
  const [estado, setEstado] = useState("");
  const { datos, cargando, error, recargar } = useApi(() => api.ordenes.listar(estado), [estado]);
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Órdenes</h1>
        <Form.Select aria-label="Filtrar por estado" style={{ maxWidth: 220 }} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="Pagada">Pagada</option>
          <option value="Pago fallido">Pago fallido</option>
        </Form.Select>
      </div>
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={recargar} />}
      {datos && <TablaOrdenes ordenes={datos} mostrarCliente enlace={(o) => `/admin/ordenes/${o.id}`} />}
    </>
  );
}
