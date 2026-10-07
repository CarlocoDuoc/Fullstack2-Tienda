import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import FormField from "../../components/FormField";
import ImagenSegura from "../../components/ImagenSegura";
import { productosDB } from "../../data/db";
import { useFormulario } from "../../hooks/useFormulario";
import { useRedireccion } from "../../hooks/useRedireccion";
import { validarFormularioProducto, validarImagen } from "../../utils/validaciones";

// Formulario compartido para crear y editar productos.
function ProductoForm({ producto }) {
  const redirigir = useRedireccion(1000);
  const [imagen, setImagen] = useState(producto?.imagen ?? "");
  const [errorImagen, setErrorImagen] = useState("");
  const [estado, setEstado] = useState(null);

  const { valores, errores, tocados, cambiar, tocarTodo, esValido } = useFormulario(
    {
      nombre: producto?.nombre ?? "",
      precio: producto ? String(producto.precio) : "",
      descripcion: producto?.descripcion ?? "",
      destacado: producto?.destacado ?? false,
    },
    validarFormularioProducto
  );

  const cambiarImagen = (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const error = validarImagen(archivo);
    if (error) {
      setErrorImagen(error);
      evento.target.value = "";
      return;
    }

    setErrorImagen("");
    const lector = new FileReader();
    lector.onload = () => setImagen(lector.result);
    lector.readAsDataURL(archivo);
  };

  const enviar = (evento) => {
    evento.preventDefault();
    tocarTodo();
    if (!esValido) {
      setEstado({ tipo: "danger", mensaje: "Revisa los campos obligatorios." });
      return;
    }

    const datos = {
      nombre: valores.nombre.trim(),
      precio: Number(valores.precio),
      descripcion: valores.descripcion.trim(),
      imagen,
      destacado: valores.destacado,
    };

    if (producto) productosDB.actualizar(producto.id, datos);
    else productosDB.crear(datos);

    setEstado({
      tipo: "success",
      mensaje: producto ? "Producto actualizado correctamente." : "Producto registrado correctamente.",
    });
    redirigir("/admin/productos");
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-success text-white">
        <h1 className="h4 mb-0">{producto ? `Editar producto #${producto.id}` : "Nuevo producto"}</h1>
      </Card.Header>
      <Card.Body className="p-4">
        <Form noValidate onSubmit={enviar}>
          <FormField
            id="nombre"
            label="Nombre"
            name="nombre"
            maxLength={100}
            required
            value={valores.nombre}
            onChange={cambiar}
            error={errores.nombre}
            touched={tocados.nombre}
          />
          <FormField
            id="precio"
            label="Precio (CLP)"
            name="precio"
            type="number"
            min={1}
            step={1}
            required
            value={valores.precio}
            onChange={cambiar}
            error={errores.precio}
            touched={tocados.precio}
          />
          <FormField
            id="descripcion"
            label="Descripción"
            name="descripcion"
            as="textarea"
            rows={3}
            maxLength={300}
            required
            value={valores.descripcion}
            onChange={cambiar}
            error={errores.descripcion}
            touched={tocados.descripcion}
          />

          <Form.Group className="mb-3" controlId="imagen">
            <Form.Label className="fw-semibold">Imagen</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={cambiarImagen} isInvalid={Boolean(errorImagen)} />
            <Form.Text muted>Máximo 512 KB. Si no subes una imagen, se mostrará una de reemplazo.</Form.Text>
            <Form.Control.Feedback type="invalid">{errorImagen}</Form.Control.Feedback>
            {imagen && (
              <div className="mt-3">
                <ImagenSegura src={imagen} alt="Vista previa" width={160} className="rounded border" />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="destacado">
            <Form.Check
              type="checkbox"
              name="destacado"
              label="Mostrar en productos destacados del Home"
              checked={valores.destacado}
              onChange={cambiar}
            />
          </Form.Group>

          {estado && (
            <Alert variant={estado.tipo} role="alert">
              {estado.mensaje}
            </Alert>
          )}

          <div className="d-flex gap-2 mt-4">
            <Button type="submit" variant="success" className="fw-bold">
              {producto ? "Guardar cambios" : "Registrar producto"}
            </Button>
            <Button as={Link} to="/admin/productos" variant="outline-secondary">
              Cancelar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default function ProductoFormPage() {
  const { id } = useParams();
  const producto = id ? productosDB.obtener(id) : null;

  if (id && !producto) {
    return (
      <Alert variant="warning">
        Producto no encontrado. <Link to="/admin/productos">Volver al listado</Link>
      </Alert>
    );
  }

  // `key` reinicia el formulario si se cambia de producto.
  return <ProductoForm key={id ?? "nuevo"} producto={producto} />;
}
