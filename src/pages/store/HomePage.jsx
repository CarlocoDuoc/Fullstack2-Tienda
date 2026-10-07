import { useMemo } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import CarruselDestacados from "../../components/CarruselDestacados";
import Hero from "../../components/Hero";
import { productosDB } from "../../data/db";
import { useColeccion } from "../../hooks/useColeccion";

export default function HomePage() {
  const productos = useColeccion(productosDB);
  const destacados = useMemo(() => productos.filter((p) => p.destacado), [productos]);

  return (
    <>
      <Hero
        titulo="Dino rancho"
        subtitulo="El lugar donde encontrarás la mascota prehistórica de tus sueños"
        imagen="img/babyspinos2.jpeg"
        alt="Baby Spinosaurus"
      >
        <Link to="/productos" className="btn-banner">
          Ver catálogo
        </Link>
      </Hero>

      <Container>
        <h1 className="titulo-seccion">Productos destacados</h1>
      </Container>

      {destacados.length > 0 ? (
        <CarruselDestacados productos={destacados} />
      ) : (
        <p className="text-center text-muted py-4">Pronto tendremos productos destacados.</p>
      )}
    </>
  );
}
