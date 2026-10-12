import { useState } from "react";
import { Badge, Button, Col, Container, Row, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Cargando from "../../components/Cargando";
import ImagenSegura from "../../components/ImagenSegura";
import MensajeError from "../../components/MensajeError";
import PrecioProducto from "../../components/PrecioProducto";
import SelectorCantidad from "../../components/SelectorCantidad";
import { useCart } from "../../context/CartContext";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";

export default function ProductoDetallePage() {
  const { id } = useParams();
  const { agregar } = useCart();
  const { datos: producto, cargando, error, recargar } = useApi(() => api.productos.obtener(id), [id]);
  const [cantidad, setCantidad] = useState(1);

  if (cargando) return <Cargando />;
  if (error) {
    return (
      <Container className="my-4">
        <MensajeError error={error} onReintentar={error.estado === 404 ? undefined : recargar} />
        <Button as={Link} to="/productos" variant="outline-success">
          Volver al catálogo
        </Button>
      </Container>
    );
  }

  const agotado = producto.stock < 1;
  const pocas = !agotado && producto.stock <= producto.stockCritico;

  return (
    <Container className="my-4">
      <nav aria-label="Ruta de navegación" className="mb-3">
        <Link to="/productos">Productos</Link>
        {producto.categoriaId && (
          <>
            {" / "}
            <Link to={`/categorias/${producto.categoriaId}`}>{producto.categoriaNombre}</Link>
          </>
        )}
      </nav>
      <Row className="g-4">
        <Col md={6}>
          <ImagenSegura src={producto.imagen} alt={producto.nombre} className="img-fluid rounded shadow-sm w-100" />
        </Col>
        <Col md={6}>
          <h1 className="h2">{producto.nombre}</h1>
          <p className="fs-4 mb-2">
            <PrecioProducto producto={producto} />
          </p>
          <p>{producto.descripcion}</p>

          <p>
            {agotado ? (
              <Badge bg="danger">Agotado</Badge>
            ) : pocas ? (
              <Badge bg="warning" text="dark">
                ¡Últimas {producto.stock} unidades!
              </Badge>
            ) : (
              <Badge bg="success">En stock ({producto.stock})</Badge>
            )}
          </p>

          {!agotado && (
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <SelectorCantidad valor={cantidad} onChange={setCantidad} max={producto.stock} />
              <Button variant="success" size="lg" onClick={() => agregar(producto, cantidad)}>
                <i className="bi bi-cart-plus me-2"></i>Agregar al carrito
              </Button>
            </div>
          )}

          {producto.ficha?.length > 0 && (
            <>
              <h2 className="h5">Ficha técnica</h2>
              <Table size="sm" bordered className="bg-white">
                <tbody>
                  {producto.ficha.map((f) => (
                    <tr key={f.etiqueta}>
                      <th scope="row" className="w-25">
                        {f.etiqueta}
                      </th>
                      <td>{f.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
