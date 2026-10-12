import { Container, Tab, Tabs } from "react-bootstrap";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import PerfilForm from "../../components/PerfilForm";
import TablaOrdenes from "../../components/TablaOrdenes";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function CuentaPage() {
  const ordenes = useApi(() => api.ordenes.mias(), []);
  return (
    <Container className="my-4">
      <h1 className="titulo-seccion fw-bold mb-3">Mi cuenta</h1>
      <Tabs defaultActiveKey="datos" id="tabs-cuenta" className="mb-3">
        <Tab eventKey="datos" title="Mis datos">
          <PerfilForm />
        </Tab>
        <Tab eventKey="compras" title="Mis compras">
          {ordenes.cargando && <Cargando />}
          {ordenes.error && <MensajeError error={ordenes.error} onReintentar={ordenes.recargar} />}
          {ordenes.datos && (
            <TablaOrdenes ordenes={ordenes.datos} enlace={(o) => `/cuenta/compras/${o.id}`} vacio="Aún no tienes compras." />
          )}
        </Tab>
      </Tabs>
    </Container>
  );
}
