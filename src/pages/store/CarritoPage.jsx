import { useState } from "react";
import { Alert, Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ImagenSegura from "../../components/ImagenSegura";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import SelectorCantidad from "../../components/SelectorCantidad";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { formatearPrecio } from "../../utils/formato";

export default function CarritoPage() {
  const { items, total, unidades, cambiarCantidad, quitar, vaciar } = useCart();
  const { usuario } = useAuth();
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Container className="my-5 text-center">
        <i className="bi bi-cart-x display-3 text-muted"></i>
        <h1 className="h3 mt-3">Tu carrito está vacío</h1>
        <p className="text-muted">Agrega productos para comenzar tu compra.</p>
        <Button as={Link} to="/productos" variant="success">
          Ver productos
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="titulo-seccion fw-bold mb-3">Carrito de compras</h1>
      <Row className="g-4">
        <Col lg={8}>
          <Table responsive className="align-middle bg-white">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-end">Precio</th>
                <th>Cantidad</th>
                <th className="text-end">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productoId}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <ImagenSegura src={item.imagen} alt="" className="miniatura" />
                      <Link to={`/productos/${item.productoId}`} className="text-decoration-none text-dark fw-semibold">
                        {item.nombre}
                      </Link>
                    </div>
                  </td>
                  <td className="text-end">{formatearPrecio(item.precio)}</td>
                  <td>
                    <SelectorCantidad
                      id={`cantidad-${item.productoId}`}
                      etiqueta={`Cantidad de ${item.nombre}`}
                      valor={item.cantidad}
                      max={item.stock}
                      onChange={(c) => cambiarCantidad(item.productoId, c)}
                    />
                  </td>
                  <td className="text-end">{formatearPrecio(item.precio * item.cantidad)}</td>
                  <td className="text-end">
                    <Button variant="outline-danger" size="sm" aria-label={`Quitar ${item.nombre}`} onClick={() => quitar(item.productoId)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="link" className="text-danger p-0" onClick={() => setConfirmarVaciar(true)}>
            Vaciar carrito
          </Button>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title as="h2" className="h5">
                Resumen
              </Card.Title>
              <div className="d-flex justify-content-between">
                <span>Unidades</span>
                <span>{unidades}</span>
              </div>
              <div className="d-flex justify-content-between fs-5 fw-bold my-2">
                <span>Total</span>
                <span>{formatearPrecio(total)}</span>
              </div>
              {!usuario && (
                <Alert variant="info" className="small mt-3 mb-0">
                  Para pagar debes iniciar sesión. Tu carrito se conserva.
                </Alert>
              )}
              <div className="d-grid gap-2 mt-3">
                <Button variant="success" size="lg" onClick={() => navigate(usuario ? "/checkout" : "/login", usuario ? undefined : { state: { desde: "/checkout" } })}>
                  {usuario ? "Ir a pagar" : "Iniciar sesión para pagar"}
                </Button>
                <Button as={Link} to="/productos" variant="outline-success">
                  Seguir comprando
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ModalConfirmacion
        show={confirmarVaciar}
        titulo="Vaciar carrito"
        mensaje="Se quitarán todos los productos del carrito. ¿Deseas continuar?"
        textoConfirmar="Vaciar"
        onCancelar={() => setConfirmarVaciar(false)}
        onConfirmar={() => {
          vaciar();
          setConfirmarVaciar(false);
        }}
      />
    </Container>
  );
}
