import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Buscador del menú: lleva al catálogo con el texto buscado (/productos?q=...).
export default function BuscadorProductos() {
  const [texto, setTexto] = useState("");
  const navigate = useNavigate();

  const buscar = (evento) => {
    evento.preventDefault();
    const consulta = texto.trim();
    navigate(consulta ? `/productos?q=${encodeURIComponent(consulta)}` : "/productos");
  };

  return (
    <Form className="d-flex mt-2 mt-lg-0" role="search" onSubmit={buscar}>
      <Form.Control
        type="search"
        placeholder="Buscar..."
        aria-label="Buscar productos"
        className="me-2"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <Button variant="outline-light" type="submit">
        Buscar
      </Button>
    </Form>
  );
}
