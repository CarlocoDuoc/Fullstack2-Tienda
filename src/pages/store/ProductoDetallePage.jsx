import { Alert, Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Hero from "../../components/Hero";
import { productosDB } from "../../data/db";
import { useColeccion } from "../../hooks/useColeccion";
import { formatearPrecio } from "../../utils/formato";

export default function ProductoDetallePage() {
  const { id } = useParams();
  const productos = useColeccion(productosDB);
  const producto = productos.find((p) => Number(p.id) === Number(id));

  if (!producto) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          No encontramos ese producto. <Link to="/productos">Volver al catálogo</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Hero titulo={producto.nombre} imagen={producto.imagen} alt={producto.nombre}>
      <p>{producto.descripcion}</p>

      {producto.ficha?.length > 0 && (
        <dl className="mb-0">
          {producto.ficha.map((dato) => (
            <div key={dato.etiqueta} className="mb-2">
              <dt className="d-inline">{dato.etiqueta}: </dt>
              <dd className="d-inline">{dato.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      <h2>{formatearPrecio(producto.precio)}</h2>
      <Link to="/productos" className="btn-banner">
        Volver al catálogo
      </Link>
    </Hero>
  );
}
