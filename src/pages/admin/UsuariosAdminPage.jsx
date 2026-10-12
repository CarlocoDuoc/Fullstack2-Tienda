import { useState } from "react";
import { Alert, Badge, Button, Form, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import Cargando from "../../components/Cargando";
import MensajeError from "../../components/MensajeError";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { formatearFecha } from "../../utils/formato";

export default function UsuariosAdminPage() {
  const { usuario: yo } = useAuth();
  const { datos, cargando, error, recargar } = useApi(() => api.usuarios.listar(), []);
  const [objetivo, setObjetivo] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState(null);

  // Cambia el rol (Cliente <-> Administrador) directamente desde la tabla
  const cambiarRol = async (u, rol) => {
    try {
      await api.usuarios.actualizar(u.id, { nombre: u.nombre, usuario: u.usuario, fechaNacimiento: u.fechaNacimiento, rol, estado: u.estado });
      setErrorEliminar(null);
      recargar();
    } catch (e) {
      setErrorEliminar(e.message);
    }
  };

  const eliminar = async () => {
    try {
      await api.usuarios.eliminar(objetivo.id);
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
        <h1 className="h3 mb-0">Usuarios</h1>
        <Button as={Link} to="/admin/usuarios/nuevo" variant="success">
          Nuevo usuario
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
              <th>Usuario</th>
              <th>Nacimiento</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {datos.map((u) => (
              <tr key={u.id}>
                <td className="fw-semibold">{u.nombre} {u.apellidos}</td>
                <td>{u.usuario}</td>
                <td>{formatearFecha(u.fechaNacimiento)}</td>
                <td>
                  <Form.Select
                    size="sm"
                    aria-label={`Rol de ${u.usuario}`}
                    value={u.rol}
                    disabled={u.id === yo?.id}
                    onChange={(e) => cambiarRol(u, e.target.value)}
                    style={{ minWidth: 150 }}
                  >
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                  </Form.Select>
                </td>
                <td>
                  <Badge bg={u.estado === "Activo" ? "success" : "secondary"}>{u.estado}</Badge>
                </td>
                <td className="text-end text-nowrap">
                  <Button as={Link} to={`/admin/usuarios/${u.id}/compras`} size="sm" variant="outline-dark" className="me-1">
                    Compras
                  </Button>
                  <Button as={Link} to={`/admin/usuarios/${u.id}/editar`} size="sm" variant="outline-primary" className="me-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" disabled={u.id === yo?.id} onClick={() => setObjetivo(u)}>
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
        titulo="Eliminar usuario"
        mensaje={`¿Seguro que deseas eliminar a "${objetivo?.nombre}"? Sus boletas se conservarán sin cuenta asociada.`}
        onCancelar={() => setObjetivo(null)}
        onConfirmar={eliminar}
      />
    </>
  );
}
