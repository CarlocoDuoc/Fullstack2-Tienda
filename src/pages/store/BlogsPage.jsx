import { Button, Card, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { blogs } from "../../data/blogs";

export default function BlogsPage() {
  return (
    <Container className="mb-5">
      <h1 className="titulo-seccion my-3">Entérate de todo</h1>
      {blogs.map((blog) => (
        <Card key={blog.id} className="mb-3">
          <Card.Header>{blog.categoria}</Card.Header>
          <Card.Body>
            <Card.Title as="h5">{blog.titulo}</Card.Title>
            <Card.Text>{blog.resumen}</Card.Text>
            <Button as={Link} to={`/blogs/${blog.id}`} variant="primary">
              Leer todo
            </Button>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
