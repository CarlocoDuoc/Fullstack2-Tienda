import { useMemo, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import Cargando from "../../components/Cargando";
import GrillaProductos from "../../components/GrillaProductos";
import MensajeError from "../../components/MensajeError";
import { useCart } from "../../context/CartContext";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { aplicarFiltros, OPCIONES_ORDEN } from "../../utils/filtros";

const FILTROS_VACIOS = { categoria: "", soloOfertas: false, precioMin: "", precioMax: "", orden: "relevancia" };

export default function ProductosPage() {
  const { agregar } = useCart();
  const productos = useApi(() => api.productos.listar(), []);
  const categorias = useApi(() => api.categorias.listar(), []);
  const [parametros] = useSearchParams();
  const consulta = (parametros.get("q") ?? "").trim();
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);

  const cambiar = (e) => {
    const { name, type, value, checked } = e.target;
    setFiltros((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const visibles = useMemo(
    () => aplicarFiltros(productos.datos ?? [], { ...filtros, q: consulta }),
    [productos.datos, filtros, consulta]
  );

  return (
    <Container className="mb-5">
      <h1 className="titulo-seccion fw-bold my-3">Nuestros Productos</h1>
      {consulta && <p className="text-muted">Resultados para “{consulta}”</p>}

      <Form className="bg-white border rounded p-3 mb-4" aria-label="Filtros de productos">
        <Row className="g-3 align-items-end">
          <Col sm={6} lg={3}>
            <Form.Group controlId="filtro-categoria">
              <Form.Label>Categoría</Form.Label>
              <Form.Select name="categoria" value={filtros.categoria} onChange={cambiar}>
                <option value="">Todas</option>
                {categorias.datos?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={6} lg={2}>
            <Form.Group controlId="filtro-min">
              <Form.Label>Precio mín.</Form.Label>
              <Form.Control type="number" min={0} name="precioMin" value={filtros.precioMin} onChange={cambiar} />
            </Form.Group>
          </Col>
          <Col xs={6} lg={2}>
            <Form.Group controlId="filtro-max">
              <Form.Label>Precio máx.</Form.Label>
              <Form.Control type="number" min={0} name="precioMax" value={filtros.precioMax} onChange={cambiar} />
            </Form.Group>
          </Col>
          <Col sm={6} lg={3}>
            <Form.Group controlId="filtro-orden">
              <Form.Label>Ordenar por</Form.Label>
              <Form.Select name="orden" value={filtros.orden} onChange={cambiar}>
                {OPCIONES_ORDEN.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col sm={6} lg={2} className="d-flex flex-column gap-2">
            <Form.Check type="switch" id="filtro-ofertas" name="soloOfertas" label="Solo ofertas" checked={filtros.soloOfertas} onChange={cambiar} />
            <Button variant="outline-secondary" size="sm" onClick={() => setFiltros(FILTROS_VACIOS)}>
              Limpiar filtros
            </Button>
          </Col>
        </Row>
      </Form>

      {productos.cargando && <Cargando texto="Cargando productos..." />}
      {productos.error && <MensajeError error={productos.error} onReintentar={productos.recargar} />}
      {!productos.cargando && !productos.error && (
        <>
          <p className="text-muted" aria-live="polite">
            {visibles.length} {visibles.length === 1 ? "producto" : "productos"}
          </p>
          <GrillaProductos productos={visibles} onAgregar={agregar} vacio="No encontramos productos con esos filtros." />
        </>
      )}
    </Container>
  );
}
