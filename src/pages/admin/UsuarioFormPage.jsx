import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Cargando from "../../components/Cargando";
import FormField from "../../components/FormField";
import MensajeError from "../../components/MensajeError";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { useFormulario } from "../../hooks/useFormulario";
import { api } from "../../services/api";
import { validarFormularioUsuarioEditar, validarFormularioUsuarioNuevo } from "../../utils/validaciones";

const VACIO = { nombre: "", usuario: "", fechaNacimiento: "", password: "", confirmPassword: "", rol: "Cliente", estado: "Activo" };

export default function UsuarioFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { usuario: yo } = useAuth();
  const existente = useApi(() => (editando ? api.usuarios.obtener(id) : Promise.resolve(null)), [id]);
  const { valores, errores, tocados, cambiar, establecer, tocarTodo, fijarErroresServidor, esValido } = useFormulario(
    VACIO,
    editando ? validarFormularioUsuarioEditar : validarFormularioUsuarioNuevo
  );
  const [estado, setEstado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const u = existente.datos;
    if (u) establecer({ nombre: u.nombre, usuario: u.usuario, fechaNacimiento: u.fechaNacimiento, rol: u.rol, estado: u.estado });
  }, [existente.datos, establecer]);

  const esUnoMismo = editando && Number(id) === yo?.id;

  const enviar = async (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) return;
    setGuardando(true);
    setEstado(null);
    try {
      const { confirmPassword, ...datos } = valores;
      if (editando) {
        const { password, ...sinClave } = datos;
        await api.usuarios.actualizar(id, sinClave);
      } else {
        await api.usuarios.crear(datos);
      }
      navigate("/admin/usuarios");
    } catch (error) {
      fijarErroresServidor(error.campos);
      setEstado({ tipo: "danger", mensaje: error.message });
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

  if (editando && existente.cargando) return <Cargando />;
  if (existente.error) return <MensajeError error={existente.error} />;

  return (
    <>
      <h1 className="h3 mb-3">{editando ? "Editar usuario" : "Nuevo usuario"}</h1>
      <Form noValidate onSubmit={enviar} className="bg-white border rounded p-3 p-md-4" style={{ maxWidth: 720 }}>
        <Row>
          <Col md={6}>
            <FormField label="Nombre" maxLength={50} required {...campo("nombre")} />
          </Col>
          <Col md={6}>
            <FormField label="Usuario" maxLength={30} required autoComplete="off" {...campo("usuario")} />
          </Col>
          <Col md={6}>
            <FormField label="Fecha de nacimiento" type="date" required {...campo("fechaNacimiento")} />
          </Col>
          <Col md={3}>
            <FormField label="Rol" as="select" disabled={esUnoMismo} {...campo("rol")}>
              <option>Cliente</option>
              <option>Administrador</option>
            </FormField>
          </Col>
          <Col md={3}>
            <FormField label="Estado" as="select" disabled={esUnoMismo} {...campo("estado")}>
              <option>Activo</option>
              <option>Inactivo</option>
            </FormField>
          </Col>
          {!editando && (
            <>
              <Col md={6}>
                <FormField label="Contraseña" type="password" maxLength={10} required autoComplete="new-password" {...campo("password")} />
              </Col>
              <Col md={6}>
                <FormField label="Confirmar contraseña" type="password" maxLength={10} required autoComplete="new-password" {...campo("confirmPassword")} />
              </Col>
            </>
          )}
        </Row>
        {esUnoMismo && <p className="text-muted small">No puedes cambiar tu propio rol ni tu estado.</p>}
        {estado && (
          <Alert variant={estado.tipo} role="alert">
            {estado.mensaje}
          </Alert>
        )}
        <div className="d-flex gap-2">
          <Button type="submit" variant="success" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
          <Button as={Link} to="/admin/usuarios" variant="outline-secondary">
            Cancelar
          </Button>
        </div>
      </Form>
    </>
  );
}
