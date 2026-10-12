import { Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import TablaOrdenes from "../../components/TablaOrdenes";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function UsuarioHistorialPage() {
  const { id } = useParams();
  const usuario = useApi(() => api.usuarios.obtener(id), [id]);
  const ordenes = useApi(() => api.usuarios.ordenes(id), [id]);

  if (usuario.cargando || ordenes.cargando) return <Cargando />;
  if (usuario.error || ordenes.error) return <MensajeError error={usuario.error ?? ordenes.error} />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Compras de {usuario.datos.nombre}</h1>
        <Button as={Link} to="/admin/usuarios" variant="outline-success" size="sm">
          Volver a usuarios
        </Button>
      </div>
      <TablaOrdenes ordenes={ordenes.datos} mostrarCliente enlace={(o) => `/admin/ordenes/${o.id}`} vacio="Este usuario aún no tiene compras." />
    </>
  );
}
