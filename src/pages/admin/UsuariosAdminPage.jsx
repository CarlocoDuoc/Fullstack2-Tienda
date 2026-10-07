import { useState } from "react";
import { Badge, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import { useAuth } from "../../context/AuthContext";
import { usuariosDB } from "../../data/db";
import { useColeccion } from "../../hooks/useColeccion";
import { formatearFecha } from "../../utils/formato";

export default function UsuariosAdminPage() {
  const usuarios = useColeccion(usuariosDB);
  const { usuario: sesion } = useAuth();
  const [aEliminar, setAEliminar] = useState(null);

  const confirmarEliminacion = () => {
    usuariosDB.eliminar(aEliminar.id);
    setAEliminar(null);
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 fw-bold mb-0">Usuarios</h1>
        <Button as={Link} to="/admin/usuarios/nuevo" variant="success">
          + Nuevo usuario
        </Button>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <Table hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Fecha de nacimiento</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-3">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => {
                const esPropio = Number(usuario.id) === Number(sesion?.id);
                return (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td className="fw-semibold">{usuario.nombre}</td>
                    <td>{usuario.correo}</td>
                    <td>{formatearFecha(usuario.fechaNacimiento)}</td>
                    <td>
                      <Badge bg={usuario.rol === "Administrador" ? "dark" : "primary"}>{usuario.rol}</Badge>
                    </td>
                    <td>
                      <Badge bg={usuario.estado === "Inactivo" ? "secondary" : "success"}>
                        {usuario.estado ?? "Activo"}
                      </Badge>
                    </td>
                    <td className="text-center text-nowrap">
                      <Button
                        as={Link}
                        to={`/admin/usuarios/${usuario.id}/editar`}
                        size="sm"
                        variant="outline-success"
                        className="me-1"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={esPropio}
                        title={esPropio ? "No puedes eliminar tu propia cuenta" : undefined}
                        onClick={() => setAEliminar(usuario)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      <ModalConfirmacion
        show={Boolean(aEliminar)}
        titulo="Eliminar usuario"
        mensaje={aEliminar && `¿Estás seguro de eliminar a ${aEliminar.nombre} (ID ${aEliminar.id})?`}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  );
}
