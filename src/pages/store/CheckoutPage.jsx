import { useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, Navigate, useNavigate } from "react-router-dom";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { comunasDe, nombresRegiones } from "../../data/regiones";
import { useFormulario } from "../../hooks/useFormulario";
import { api } from "../../services/api";
import { guardarUltimaOrden } from "../../utils/boleta";
import { formatearPrecio } from "../../utils/formato";
import { validarFormularioCheckout } from "../../utils/validaciones";

export default function CheckoutPage() {
  const { usuario } = useAuth();
  const { items, total, vaciar } = useCart();
  const navigate = useNavigate();
  const [pago, setPago] = useState("aprobado");
  const [guardarDatos, setGuardarDatos] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const iniciales = useMemo(
    () => ({
      nombre: usuario?.nombre ?? "",
      apellidos: usuario?.apellidos ?? "",
      correo: "",
      calle: usuario?.calle ?? "",
      departamento: usuario?.departamento ?? "",
      region: usuario?.region ?? "",
      comuna: usuario?.comuna ?? "",
      indicaciones: "",
    }),
    [usuario]
  );
  const { valores, errores, tocados, cambiar, establecer, tocarTodo, fijarErroresServidor, esValido } = useFormulario(
    iniciales,
    validarFormularioCheckout
  );

  if (items.length === 0) return <Navigate to="/carrito" replace />;

  const campo = (nombre) => ({
    id: nombre,
    name: nombre,
    value: valores[nombre],
    onChange: cambiar,
    error: errores[nombre],
    touched: tocados[nombre],
  });

  const pagar = async (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) {
      setError({ mensaje: "Revisa los campos marcados en rojo." });
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const orden = await api.ordenes.crear({
        cliente: { nombre: valores.nombre, apellidos: valores.apellidos, correo: valores.correo },
        direccion: {
          calle: valores.calle,
          departamento: valores.departamento,
          region: valores.region,
          comuna: valores.comuna,
          indicaciones: valores.indicaciones,
        },
        items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        pago: { resultado: pago },
        guardarDatos: Boolean(usuario) && guardarDatos,
      });
      guardarUltimaOrden(orden);
      if (orden.estado === "Pagada") {
        vaciar();
        navigate("/compra/exitosa", { replace: true });
      } else {
        navigate("/compra/error", { replace: true });
      }
    } catch (e) {
      fijarErroresServidor(e.campos);
      setError({ mensaje: e.message, stock: e.estado === 409 });
      setEnviando(false);
    }
  };

  return (
    <Container className="my-4">
      <h1 className="titulo-seccion fw-bold mb-3">Finalizar compra</h1>
      <Form noValidate onSubmit={pagar}>
        <Row className="g-4">
          <Col lg={7}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h2 className="h5 mb-3">Datos del cliente</h2>
                <Row>
                  <Col md={6}>
                    <FormField label="Nombre" maxLength={50} required autoComplete="given-name" {...campo("nombre")} />
                  </Col>
                  <Col md={6}>
                    <FormField label="Apellidos" maxLength={50} required autoComplete="family-name" {...campo("apellidos")} />
                  </Col>
                  <Col xs={12}>
                    <FormField label="Correo electrónico" type="email" maxLength={100} required autoComplete="email" {...campo("correo")} />
                  </Col>
                </Row>

                <h2 className="h5 my-3">Dirección de despacho</h2>
                <Row>
                  <Col md={8}>
                    <FormField label="Calle y número" maxLength={120} required autoComplete="street-address" {...campo("calle")} />
                  </Col>
                  <Col md={4}>
                    <FormField label="Departamento (opcional)" maxLength={30} {...campo("departamento")} />
                  </Col>
                  <Col md={6}>
                    <FormField
                      label="Región"
                      as="select"
                      required
                      {...campo("region")}
                      onChange={(e) => {
                        cambiar(e);
                        establecer({ comuna: "" });
                      }}
                    >
                      <option value="">Selecciona una región</option>
                      {nombresRegiones.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </FormField>
                  </Col>
                  <Col md={6}>
                    <FormField label="Comuna" as="select" required disabled={!valores.region} {...campo("comuna")}>
                      <option value="">Selecciona una comuna</option>
                      {comunasDe(valores.region).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </FormField>
                  </Col>
                  <Col xs={12}>
                    <FormField label="Indicaciones de entrega (opcional)" as="textarea" rows={2} maxLength={300} {...campo("indicaciones")} />
                  </Col>
                </Row>
                {usuario && (
                  <Form.Check
                    type="checkbox"
                    id="guardar-datos"
                    label="Guardar estos datos en mi cuenta"
                    checked={guardarDatos}
                    onChange={(e) => setGuardarDatos(e.target.checked)}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h2 className="h5">Resumen del pedido</h2>
                <ul className="list-unstyled mb-3">
                  {items.map((i) => (
                    <li key={i.productoId} className="d-flex justify-content-between">
                      <span>
                        {i.nombre} × {i.cantidad}
                      </span>
                      <span>{formatearPrecio(i.precio * i.cantidad)}</span>
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-between fs-5 fw-bold border-top pt-2">
                  <span>Total</span>
                  <span>{formatearPrecio(total)}</span>
                </div>
                <small className="text-muted">El precio final se confirma al pagar con los valores vigentes de la tienda.</small>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h2 className="h5">Pago (simulado)</h2>
                <p className="text-muted small">No se realiza ningún cobro real. Elige el resultado para probar ambos flujos.</p>
                <Form.Check
                  type="radio"
                  id="pago-aprobado"
                  name="pago"
                  label="Pago aprobado"
                  checked={pago === "aprobado"}
                  onChange={() => setPago("aprobado")}
                />
                <Form.Check
                  type="radio"
                  id="pago-rechazado"
                  name="pago"
                  label="Pago rechazado"
                  checked={pago === "rechazado"}
                  onChange={() => setPago("rechazado")}
                />
              </Card.Body>
            </Card>

            {error && (
              <Alert variant="danger" role="alert">
                {error.mensaje}{" "}
                {error.stock && (
                  <Link to="/carrito" className="alert-link">
                    Revisar carrito
                  </Link>
                )}
              </Alert>
            )}
            <div className="d-grid gap-2">
              <Button type="submit" variant="success" size="lg" disabled={enviando}>
                {enviando ? "Procesando pago..." : `Pagar ${formatearPrecio(total)}`}
              </Button>
              <Button as={Link} to="/carrito" variant="outline-secondary">
                Volver al carrito
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
