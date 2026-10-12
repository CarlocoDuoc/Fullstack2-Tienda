import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useFormulario } from "../../hooks/useFormulario";
import { api } from "../../services/api";
import { validarFormularioContacto } from "../../utils/validaciones";

export default function ContactoPage() {
  const { usuario } = useAuth();
  const [estado, setEstado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const iniciales = { nombre: usuario?.nombre ?? "", correo: "", asunto: "", mensaje: "" };
  const { valores, errores, tocados, cambiar, establecer, tocarTodo, fijarErroresServidor, esValido } = useFormulario(
    iniciales,
    validarFormularioContacto
  );

  const enviar = async (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) return;
    setEnviando(true);
    setEstado(null);
    try {
      await api.contacto.enviar(valores);
      setEstado({ tipo: "success", mensaje: "¡Mensaje enviado! Te responderemos pronto." });
      establecer({ asunto: "", mensaje: "" });
    } catch (error) {
      fijarErroresServidor(error.campos);
      setEstado({ tipo: "danger", mensaje: error.message });
    } finally {
      setEnviando(false);
    }
  };

  const campo = (nombre) => ({
    id: nombre,
    name: nombre,
    value: valores[nombre],
    onChange: cambiar,
    error: errores[nombre],
    touched: tocados[nombre],
  });

  return (
    <Container className="my-4">
      <h1 className="titulo-seccion fw-bold mb-3">Contacto</h1>
      <Row className="g-4">
        <Col md={5}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h2 className="h5">Escríbenos</h2>
              <p className="mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-success"></i>Av. Jurásica #123, Santiago
              </p>
              <p className="mb-2">
                <i className="bi bi-envelope-fill me-2 text-success"></i>contacto@dinorancho.cl
              </p>
              <p className="mb-0">
                <i className="bi bi-telephone-fill me-2 text-success"></i>+56 9 1234 5678
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form noValidate onSubmit={enviar}>
                <FormField label="Nombre" maxLength={50} required {...campo("nombre")} />
                <FormField label="Correo electrónico" type="email" maxLength={100} required {...campo("correo")} />
                <FormField label="Asunto" maxLength={100} required {...campo("asunto")} />
                <FormField label="Mensaje" as="textarea" rows={5} maxLength={1000} required {...campo("mensaje")} />
                {estado && (
                  <Alert variant={estado.tipo} role="alert">
                    {estado.mensaje}
                  </Alert>
                )}
                <Button type="submit" variant="success" disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar mensaje"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
