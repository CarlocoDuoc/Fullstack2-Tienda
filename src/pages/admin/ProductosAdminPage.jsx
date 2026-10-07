import { useState } from "react";
import { Badge, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import ImagenSegura from "../../components/ImagenSegura";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import { productosDB } from "../../data/db";
import { useColeccion } from "../../hooks/useColeccion";
import { formatearPrecio } from "../../utils/formato";

export default function ProductosAdminPage() {
  const productos = useColeccion(productosDB);
  const [aEliminar, setAEliminar] = useState(null);

  const confirmarEliminacion = () => {
    productosDB.eliminar(aEliminar.id);
    setAEliminar(null);
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 fw-bold mb-0">Productos</h1>
        <Button as={Link} to="/admin/productos/nuevo" variant="success">
          + Nuevo producto
        </Button>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <Table hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  No hay productos registrados.
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.id}</td>
                  <td>
                    <ImagenSegura
                      src={producto.imagen}
                      alt={producto.nombre}
                      width={50}
                      height={50}
                      className="rounded"
                      style={{ objectFit: "cover" }}
                    />
                  </td>
                  <td className="fw-semibold">
                    {producto.nombre}{" "}
                    {producto.destacado && (
                      <Badge bg="success" className="ms-1">
                        Destacado
                      </Badge>
                    )}
                  </td>
                  <td>{formatearPrecio(producto.precio)}</td>
                  <td>{producto.descripcion}</td>
                  <td className="text-center text-nowrap">
                    <Button
                      as={Link}
                      to={`/admin/productos/${producto.id}/editar`}
                      size="sm"
                      variant="outline-success"
                      className="me-1"
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setAEliminar(producto)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <ModalConfirmacion
        show={Boolean(aEliminar)}
        titulo="Eliminar producto"
        mensaje={aEliminar && `¿Estás seguro de que deseas eliminar "${aEliminar.nombre}" (ID: ${aEliminar.id})?`}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  );
}
