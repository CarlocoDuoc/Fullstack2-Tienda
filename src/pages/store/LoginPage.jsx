import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useFormulario } from "../../hooks/useFormulario";
import { useRedireccion } from "../../hooks/useRedireccion";
import { validarFormularioLogin } from "../../utils/validaciones";

const VALORES_INICIALES = { correo: "", password: "" };

export default function LoginPage() {
  const { login } = useAuth();
  const ubicacion = useLocation();
  const redirigir = useRedireccion(1200);
  const [estado, setEstado] = useState(null);

  const { valores, errores, tocados, cambiar, tocarTodo, esValido } = useFormulario(
    VALORES_INICIALES,
    validarFormularioLogin
  );

  const enviar = (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) return;

    const resultado = login(valores.correo, valores.password);
    if (!resultado.ok) {
      setEstado({ tipo: "danger", mensaje: resultado.error });
      return;
    }

    setEstado({ tipo: "success", mensaje: `¡Bienvenido/a, ${resultado.usuario.nombre}! Redirigiendo...` });
    const destino = resultado.usuario.rol === "Administrador" ? "/admin" : ubicacion.state?.desde ?? "/";
    redirigir(destino);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-success text-white text-center py-3">
              <h1 className="mb-0 fs-4">Iniciar Sesión</h1>
            </Card.Header>
            <Card.Body className="p-4">
              <Form noValidate onSubmit={enviar}>
                <FormField
                  id="correo"
                  label="Correo Electrónico"
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
                  id="password"
                  label="Contraseña"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  maxLength={10}
                  autoComplete="current-password"
                  required
                  value={valores.password}
                  onChange={cambiar}
                  error={errores.password}
                  touched={tocados.password}
                />

                {estado && (
                  <Alert variant={estado.tipo} className="mt-3" role="alert">
                    {estado.mensaje}
                  </Alert>
                )}

                <div className="d-flex gap-2 mt-4">
                  <Button type="submit" variant="success" className="flex-fill fw-bold">
                    Ingresar
                  </Button>
                  <Button as={Link} to="/registro" variant="outline-success" className="flex-fill fw-bold">
                    Registrarse
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
