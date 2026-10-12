import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Cargando from "../../components/Cargando";
import FormField from "../../components/FormField";
import ImagenSegura from "../../components/ImagenSegura";
import MensajeError from "../../components/MensajeError";
import { useFormulario } from "../../hooks/useFormulario";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { validarFormularioProducto, validarImagen } from "../../utils/validaciones";

const VACIO = {
  nombre: "",
  descripcion: "",
  precio: "",
  precioOferta: "",
  stock: "0",
  stockCritico: "5",
  categoriaId: "",
  destacado: false,
};

export default function ProductoFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const categorias = useApi(() => api.categorias.listar(), []);
  const existente = useApi(() => (editando ? api.productos.obtener(id) : Promise.resolve(null)), [id]);

  const { valores, errores, tocados, cambiar, establecer, tocarTodo, fijarErroresServidor, esValido } = useFormulario(
    VACIO,
    validarFormularioProducto
  );
  const [imagen, setImagen] = useState("");
  const [errorImagen, setErrorImagen] = useState("");
  const [ficha, setFicha] = useState([]);
  const [estado, setEstado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const p = existente.datos;
    if (!p) return;
    establecer({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: String(p.precio),
      precioOferta: p.precioOferta === null ? "" : String(p.precioOferta),
      stock: String(p.stock),
      stockCritico: String(p.stockCritico),
      categoriaId: p.categoriaId === null ? "" : String(p.categoriaId),
      destacado: p.destacado,
    });
    setImagen(p.imagen);
    setFicha(p.ficha ?? []);
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

  const cambiarFicha = (indice, clave, valor) =>
    setFicha((f) => f.map((fila, i) => (i === indice ? { ...fila, [clave]: valor } : fila)));

  const enviar = async (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) return;
    setGuardando(true);
    setEstado(null);
    const datos = {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      precioOferta: valores.precioOferta === "" ? null : Number(valores.precioOferta),
      stock: Number(valores.stock),
      stockCritico: Number(valores.stockCritico),
      categoriaId: valores.categoriaId === "" ? null : Number(valores.categoriaId),
      destacado: valores.destacado,
      imagen,
      ficha: ficha.filter((f) => f.etiqueta.trim()).map((f) => ({ etiqueta: f.etiqueta.trim(), valor: f.valor.trim() })),
    };
    try {
      if (editando) await api.productos.actualizar(id, datos);
      else await api.productos.crear(datos);
      navigate("/admin/productos");
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
      <h1 className="h3 mb-3">{editando ? "Editar producto" : "Nuevo producto"}</h1>
      <Form noValidate onSubmit={enviar} className="bg-white border rounded p-3 p-md-4">
        <Row>
          <Col md={8}>
            <FormField label="Nombre" maxLength={100} required {...campo("nombre")} />
          </Col>
          <Col md={4}>
            <FormField label="Categoría" as="select" {...campo("categoriaId")}>
              <option value="">Sin categoría</option>
              {categorias.datos?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </FormField>
          </Col>
          <Col xs={12}>
            <FormField label="Descripción" as="textarea" rows={3} maxLength={300} required {...campo("descripcion")} />
          </Col>
          <Col sm={6} md={3}>
            <FormField label="Precio (CLP)" type="number" min={1} required {...campo("precio")} />
          </Col>
          <Col sm={6} md={3}>
            <FormField label="Precio de oferta" type="number" min={1} ayuda="Opcional. Menor al precio." {...campo("precioOferta")} />
          </Col>
          <Col sm={6} md={3}>
            <FormField label="Stock" type="number" min={0} required {...campo("stock")} />
          </Col>
          <Col sm={6} md={3}>
            <FormField label="Stock crítico" type="number" min={0} required {...campo("stockCritico")} />
          </Col>
        </Row>

        <Form.Check type="switch" id="destacado" name="destacado" label="Producto destacado (aparece en el inicio)" className="mb-3" checked={valores.destacado} onChange={cambiar} />

        <Row className="mb-3 align-items-center">
          <Col md={4}>
            <ImagenSegura src={imagen} alt="Vista previa" className="img-fluid rounded border" />
          </Col>
          <Col md={8}>
            <Form.Group controlId="imagen">
              <Form.Label className="fw-semibold">Imagen (máx. 512 KB)</Form.Label>
              <Form.Control type="file" accept="image/*" isInvalid={Boolean(errorImagen)} onChange={elegirImagen} />
              <Form.Control.Feedback type="invalid">{errorImagen}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <h2 className="h5">Ficha técnica</h2>
        {ficha.map((fila, i) => (
          <Row key={i} className="g-2 mb-2">
            <Col xs={5}>
              <Form.Control aria-label={`Característica ${i + 1}`} placeholder="Característica" maxLength={60} value={fila.etiqueta} onChange={(e) => cambiarFicha(i, "etiqueta", e.target.value)} />
            </Col>
            <Col xs={5}>
              <Form.Control aria-label={`Valor ${i + 1}`} placeholder="Valor" maxLength={300} value={fila.valor} onChange={(e) => cambiarFicha(i, "valor", e.target.value)} />
            </Col>
            <Col xs={2}>
              <Button variant="outline-danger" aria-label="Quitar fila" onClick={() => setFicha((f) => f.filter((_, j) => j !== i))}>
                <i className="bi bi-x-lg"></i>
              </Button>
            </Col>
          </Row>
        ))}
        <Button variant="outline-secondary" size="sm" className="mb-3" onClick={() => setFicha((f) => [...f, { etiqueta: "", valor: "" }])}>
          Agregar característica
        </Button>

        {estado && (
          <Alert variant={estado.tipo} role="alert">
            {estado.mensaje}
          </Alert>
        )}
        <div className="d-flex gap-2">
          <Button type="submit" variant="success" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
          <Button as={Link} to="/admin/productos" variant="outline-secondary">
            Cancelar
          </Button>
        </div>
      </Form>
    </>
  );
}
