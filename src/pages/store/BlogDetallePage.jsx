import { Alert, Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Hero from "../../components/Hero";
import { blogs } from "../../data/blogs";

export default function BlogDetallePage() {
  const { id } = useParams();
  const blog = blogs.find((b) => Number(b.id) === Number(id));

  if (!blog) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          No encontramos esa publicación. <Link to="/blogs">Volver al blog</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Hero titulo={blog.titulo} imagen={blog.imagen} alt={blog.titulo}>
      {blog.contenido.map((parrafo, indice) => (
        <p key={indice} className="mb-0">
          {parrafo}
        </p>
      ))}
      <Link to="/blogs" className="btn-banner">
        Volver al blog
      </Link>
    </Hero>
  );
}
