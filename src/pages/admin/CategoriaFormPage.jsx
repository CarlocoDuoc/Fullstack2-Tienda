import { useEffect, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Cargando from "../../components/Cargando";
import FormField from "../../components/FormField";
import ImagenSegura from "../../components/ImagenSegura";
import MensajeError from "../../components/MensajeError";
import { useApi } from "../../hooks/useApi";
import { useFormulario } from "../../hooks/useFormulario";
import { api } from "../../services/api";
import { validarFormularioCategoria, validarImagen } from "../../utils/validaciones";

export default function CategoriaFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const existente = useApi(() => (editando ? api.categorias.obtener(id) : Promise.resolve(null)), [id]);
  const { valores, errores, tocados, cambiar, establecer, tocarTodo, fijarErroresServidor, esValido } = useFormulario(
    { nombre: "", descripcion: "" },
    validarFormularioCategoria
  );
  const [imagen, setImagen] = useState("");
  const [errorImagen, setErrorImagen] = useState("");
  const [estado, setEstado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!existente.datos) return;
    establecer({ nombre: existente.datos.nombre, descripcion: existente.datos.descripcion });
    setImagen(existente.datos.imagen);
  }, [existente.datos, establecer]);

  const elegirImagen = (evento) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    const error = validarImagen(archivo);
    setErrorImagen(error);
    if (error) return;
    const lector = new FileReader();
    lector.onload = () => setImagen(String(lector.result));
    lector.readAsDataURL(archivo);
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) return;
    setGuardando(true);
    setEstado(null);
    try {
      const datos = { nombre: valores.nombre, descripcion: valores.descripcion, imagen };
      if (editando) await api.categorias.actualizar(id, datos);
      else await api.categorias.crear(datos);
      navigate("/admin/categorias");
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
      <h1 className="h3 mb-3">{editando ? "Editar categoría" : "Nueva categoría"}</h1>
      <Form noValidate onSubmit={enviar} className="bg-white border rounded p-3 p-md-4" style={{ maxWidth: 640 }}>
        <FormField label="Nombre" maxLength={60} required {...campo("nombre")} />
        <FormField label="Descripción" as="textarea" rows={2} maxLength={200} {...campo("descripcion")} />
        <Form.Group controlId="imagen" className="mb-3">
          <Form.Label className="fw-semibold">Imagen (máx. 512 KB)</Form.Label>
          {imagen && <ImagenSegura src={imagen} alt="Vista previa" className="img-fluid rounded border d-block mb-2" style={{ maxHeight: 160 }} />}
          <Form.Control type="file" accept="image/*" isInvalid={Boolean(errorImagen)} onChange={elegirImagen} />
          <Form.Control.Feedback type="invalid">{errorImagen}</Form.Control.Feedback>
        </Form.Group>
        {estado && (
          <Alert variant={estado.tipo} role="alert">
            {estado.mensaje}
          </Alert>
        )}
        <div className="d-flex gap-2">
          <Button type="submit" variant="success" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
          <Button as={Link} to="/admin/categorias" variant="outline-secondary">
            Cancelar
          </Button>
        </div>
      </Form>
    </>
  );
}
