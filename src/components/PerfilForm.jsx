import { useMemo, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { nombresRegiones, comunasDe } from "../data/regiones";
import { useFormulario } from "../hooks/useFormulario";
import { api } from "../services/api";
import { validarFormularioPerfil } from "../utils/validaciones";
import FormField from "./FormField";

// Formulario de datos personales, dirección y cambio de contraseña (cliente y administrador).
export default function PerfilForm() {
  const { usuario, actualizarUsuario } = useAuth();
  const [estado, setEstado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const iniciales = useMemo(
    () => ({
      nombre: usuario.nombre ?? "",
      apellidos: usuario.apellidos ?? "",
      fechaNacimiento: usuario.fechaNacimiento ?? "",
      calle: usuario.calle ?? "",
      departamento: usuario.departamento ?? "",
      region: usuario.region ?? "",
      comuna: usuario.comuna ?? "",
      passwordActual: "",
      passwordNueva: "",
    }),
    [usuario]
  );
  const { valores, errores, tocados, cambiar, establecer, tocarTodo, fijarErroresServidor, esValido } = useFormulario(
    iniciales,
    validarFormularioPerfil
  );

  const alCambiarRegion = (e) => {
    cambiar(e);
    establecer({ comuna: "" });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) return;
    setGuardando(true);
    setEstado(null);
    try {
      const { usuario: actualizado } = await api.auth.perfil(valores);
      actualizarUsuario(actualizado);
      establecer({ passwordActual: "", passwordNueva: "" });
      setEstado({ tipo: "success", mensaje: "Tus datos se guardaron correctamente." });
    } catch (error) {
      fijarErroresServidor(error.campos);
      setEstado({ tipo: "danger", mensaje: error.message });
    } finally {
      setGuardando(false);
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
    <Form noValidate onSubmit={enviar}>
      <p className="text-muted">Usuario: {usuario.usuario}</p>
      <Row>
        <Col md={6}>
          <FormField label="Nombre" maxLength={50} required {...campo("nombre")} />
        </Col>
        <Col md={6}>
          <FormField label="Apellidos" maxLength={50} {...campo("apellidos")} />
        </Col>
        <Col md={6}>
          <FormField label="Fecha de nacimiento" type="date" required {...campo("fechaNacimiento")} />
        </Col>
      </Row>

      <h2 className="h5 mt-3">Dirección de despacho</h2>
      <Row>
        <Col md={8}>
          <FormField label="Calle y número" maxLength={120} {...campo("calle")} />
        </Col>
        <Col md={4}>
          <FormField label="Departamento (opcional)" maxLength={30} {...campo("departamento")} />
        </Col>
        <Col md={6}>
          <FormField label="Región" as="select" {...campo("region")} onChange={alCambiarRegion}>
            <option value="">Selecciona una región</option>
            {nombresRegiones.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </FormField>
        </Col>
        <Col md={6}>
          <FormField label="Comuna" as="select" disabled={!valores.region} {...campo("comuna")}>
            <option value="">Selecciona una comuna</option>
            {comunasDe(valores.region).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormField>
        </Col>
      </Row>

      <h2 className="h5 mt-3">Cambiar contraseña (opcional)</h2>
      <Row>
        <Col md={6}>
          <FormField label="Contraseña actual" type="password" maxLength={10} autoComplete="current-password" {...campo("passwordActual")} />
        </Col>
        <Col md={6}>
          <FormField label="Contraseña nueva" type="password" maxLength={10} autoComplete="new-password" ayuda="Entre 4 y 10 caracteres." {...campo("passwordNueva")} />
        </Col>
      </Row>

      {estado && (
        <Alert variant={estado.tipo} role="alert">
          {estado.mensaje}
        </Alert>
      )}
      <Button type="submit" variant="success" disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar cambios"}
      </Button>
    </Form>
  );
}
