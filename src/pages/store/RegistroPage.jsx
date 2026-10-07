import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import FormField from "../../components/FormField";
import { useFormulario } from "../../hooks/useFormulario";
import { useRedireccion } from "../../hooks/useRedireccion";
import { crearUsuario } from "../../services/usuariosService";
import { validarFormularioRegistro } from "../../utils/validaciones";

const VALORES_INICIALES = {
  nombre: "",
  correo: "",
  fechaNacimiento: "",
  password: "",
  confirmPassword: "",
  terminos: false,
};

export default function RegistroPage() {
  const redirigir = useRedireccion(1500);
  const [estado, setEstado] = useState(null);

  const { valores, errores, tocados, cambiar, tocarTodo, esValido } = useFormulario(
    VALORES_INICIALES,
    validarFormularioRegistro
  );

  const enviar = (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) {
      setEstado({ tipo: "danger", mensaje: "Debes completar correctamente todos los campos." });
      return;
    }

    const resultado = crearUsuario({
      nombre: valores.nombre,
      correo: valores.correo,
      fechaNacimiento: valores.fechaNacimiento,
      password: valores.password,
      rol: "Cliente",
      estado: "Activo",
    });

    if (!resultado.ok) {
      setEstado({ tipo: "danger", mensaje: resultado.error });
      return;
    }

    setEstado({ tipo: "success", mensaje: "Registrado exitosamente, redirigiendo al inicio de sesión." });
    redirigir("/login");
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={9} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-success text-white text-center py-3">
              <h1 className="mb-0 fs-4">Crear cuenta</h1>
            </Card.Header>
            <Card.Body className="p-4">
              <Form noValidate onSubmit={enviar}>
                <FormField
                  id="nombre"
                  label="Nombre completo"
                  name="nombre"
                  maxLength={50}
                  autoComplete="name"
                  required
                  value={valores.nombre}
                  onChange={cambiar}
                  error={errores.nombre}
                  touched={tocados.nombre}
                />
                <FormField
                  id="correo"
                  label="Correo electrónico"
                  name="correo"
                  type="email"
                  placeholder="ejemplo@duocuc.cl"
                  maxLength={100}
                  autoComplete="email"
                  required
                  value={valores.correo}
                  onChange={cambiar}
                  error={errores.correo}
                  touched={tocados.correo}
                />
                <FormField
                  id="fechaNacimiento"
                  label="Fecha de nacimiento"
                  name="fechaNacimiento"
                  type="date"
                  autoComplete="bday"
                  required
                  value={valores.fechaNacimiento}
                  onChange={cambiar}
                  error={errores.fechaNacimiento}
                  touched={tocados.fechaNacimiento}
                />
                <FormField
                  id="password"
                  label="Contraseña"
                  name="password"
                  type="password"
                  maxLength={10}
                  autoComplete="new-password"
                  ayuda="Entre 4 y 10 caracteres."
                  required
                  value={valores.password}
                  onChange={cambiar}
                  error={errores.password}
                  touched={tocados.password}
                />
                <FormField
                  id="confirmPassword"
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  type="password"
                  maxLength={10}
                  autoComplete="new-password"
                  required
                  value={valores.confirmPassword}
                  onChange={cambiar}
                  error={errores.confirmPassword}
                  touched={tocados.confirmPassword}
                />

                <Form.Group className="mb-3" controlId="terminos">
                  <Form.Check
                    type="checkbox"
                    name="terminos"
                    label="Acepto los términos y condiciones"
                    checked={valores.terminos}
                    onChange={cambiar}
                    isInvalid={Boolean(tocados.terminos && errores.terminos)}
                    isValid={Boolean(tocados.terminos && !errores.terminos)}
                    feedback={errores.terminos}
                    feedbackType="invalid"
                  />
                </Form.Group>

                {estado && (
                  <Alert variant={estado.tipo} className="mt-3" role="alert">
                    {estado.mensaje}
                  </Alert>
                )}

                <div className="d-flex gap-2 mt-4">
                  <Button type="submit" variant="success" className="flex-fill fw-bold">
                    Registrarse
                  </Button>
                  <Button as={Link} to="/login" variant="outline-success" className="flex-fill fw-bold">
                    Ya tengo cuenta
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
