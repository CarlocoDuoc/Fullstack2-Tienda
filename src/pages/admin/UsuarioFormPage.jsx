import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { usuariosDB } from "../../data/db";
import { useFormulario } from "../../hooks/useFormulario";
import { useRedireccion } from "../../hooks/useRedireccion";
import { actualizarUsuario, crearUsuario } from "../../services/usuariosService";
import { validarFormularioUsuarioEditar, validarFormularioUsuarioNuevo } from "../../utils/validaciones";

// Formulario compartido para crear y editar usuarios.
function UsuarioForm({ usuario }) {
  const esEdicion = Boolean(usuario);
  const { usuario: sesion } = useAuth();
  const redirigir = useRedireccion(1200);
  const [estado, setEstado] = useState(null);

  // Un administrador no puede quitarse a sí mismo el rol ni desactivarse.
  const esPropio = esEdicion && Number(usuario.id) === Number(sesion?.id);

  const { valores, errores, tocados, cambiar, tocarTodo, esValido } = useFormulario(
    {
      nombre: usuario?.nombre ?? "",
      correo: usuario?.correo ?? "",
      fechaNacimiento: usuario?.fechaNacimiento ?? "",
      ...(esEdicion ? {} : { password: "", confirmPassword: "" }),
      rol: usuario?.rol ?? "Cliente",
      estado: usuario?.estado ?? "Activo",
    },
    esEdicion ? validarFormularioUsuarioEditar : validarFormularioUsuarioNuevo
  );

  const enviar = (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) {
      setEstado({ tipo: "danger", mensaje: "Revisa los campos obligatorios." });
      return;
    }

    const resultado = esEdicion ? actualizarUsuario(usuario.id, valores) : crearUsuario(valores);
    if (!resultado.ok) {
      setEstado({ tipo: "danger", mensaje: resultado.error });
      return;
    }

    setEstado({
      tipo: "success",
      mensaje: esEdicion ? "Cambios guardados exitosamente. Redirigiendo..." : "Usuario creado con éxito. Redirigiendo...",
    });
    redirigir("/admin/usuarios");
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-success text-white">
        <h1 className="h4 mb-0">{esEdicion ? `Editar usuario #${usuario.id}` : "Nuevo usuario"}</h1>
      </Card.Header>
      <Card.Body className="p-4">
        <Form noValidate onSubmit={enviar}>
          <FormField
            id="nombre"
            label="Nombre"
            name="nombre"
            maxLength={50}
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
            required
            value={valores.fechaNacimiento}
            onChange={cambiar}
            error={errores.fechaNacimiento}
            touched={tocados.fechaNacimiento}
          />

          {!esEdicion && (
            <>
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
            </>
          )}

          <FormField
            id="rol"
            label="Rol"
            name="rol"
            as="select"
            disabled={esPropio}
            ayuda={esPropio ? "No puedes cambiar tu propio rol." : undefined}
            value={valores.rol}
            onChange={cambiar}
          >
            <option value="Cliente">Cliente</option>
            <option value="Administrador">Administrador</option>
          </FormField>
          <FormField
            id="estado"
            label="Estado"
            name="estado"
            as="select"
            disabled={esPropio}
            value={valores.estado}
            onChange={cambiar}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </FormField>

          {estado && (
            <Alert variant={estado.tipo} role="alert">
              {estado.mensaje}
            </Alert>
          )}

          <div className="d-flex gap-2 mt-4">
            <Button type="submit" variant="success" className="fw-bold">
              {esEdicion ? "Guardar cambios" : "Crear usuario"}
            </Button>
            <Button as={Link} to="/admin/usuarios" variant="outline-secondary">
              Cancelar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default function UsuarioFormPage() {
  const { id } = useParams();
  const usuario = id ? usuariosDB.obtener(id) : null;

  if (id && !usuario) {
    return (
      <Alert variant="warning">
        Usuario no encontrado. <Link to="/admin/usuarios">Volver al listado</Link>
      </Alert>
    );
  }

  return <UsuarioForm key={id ?? "nuevo"} usuario={usuario} />;
}
