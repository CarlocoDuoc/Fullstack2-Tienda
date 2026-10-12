import { useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function CategoriasAdminPage() {
  const { datos, cargando, error, recargar } = useApi(() => api.categorias.listar(), []);
  const [objetivo, setObjetivo] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState(null);

  const eliminar = async () => {
    try {
      await api.categorias.eliminar(objetivo.id);
      setErrorEliminar(null);
      recargar();
    } catch (e) {
      setErrorEliminar(e.message);
    }
    setObjetivo(null);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Categorías</h1>
        <Button as={Link} to="/admin/categorias/nueva" variant="success">
          Nueva categoría
        </Button>
      </div>
      {errorEliminar && <Alert variant="danger">{errorEliminar}</Alert>}
      {cargando && <Cargando />}
      {error && <MensajeError error={error} onReintentar={recargar} />}
      {datos && (
        <Table responsive hover className="align-middle bg-white">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th className="text-center">Productos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {datos.map((c) => (
              <tr key={c.id}>
                <td className="fw-semibold">{c.nombre}</td>
                <td>{c.descripcion}</td>
                <td className="text-center">{c.totalProductos}</td>
                <td className="text-end text-nowrap">
                  <Button as={Link} to={`/admin/categorias/${c.id}/editar`} size="sm" variant="outline-primary" className="me-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setObjetivo(c)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <ModalConfirmacion
        show={Boolean(objetivo)}
        titulo="Eliminar categoría"
        mensaje={`¿Eliminar "${objetivo?.nombre}"? Sus ${objetivo?.totalProductos ?? 0} productos quedarán sin categoría.`}
        onCancelar={() => setObjetivo(null)}
        onConfirmar={eliminar}
      />
    </>
  );
}
