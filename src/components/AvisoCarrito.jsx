import { Toast, ToastContainer } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Aviso flotante cuando se agrega un producto al carrito.
export default function AvisoCarrito() {
  const { aviso, cerrarAviso } = useCart();
  return (
    <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1080 }}>
      <Toast key={aviso?.id} show={Boolean(aviso)} onClose={cerrarAviso} delay={3500} autohide bg={aviso?.tipo === "warning" ? "warning" : "light"}>
        <Toast.Header>
          <strong className="me-auto">Carrito</strong>
        </Toast.Header>
        <Toast.Body>
          {aviso?.mensaje}{" "}
          {aviso?.tipo === "success" && (
            <Link to="/carrito" onClick={cerrarAviso}>
              Ver carrito
            </Link>
          )}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
