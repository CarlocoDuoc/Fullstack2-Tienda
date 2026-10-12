import { Button, Form, InputGroup } from "react-bootstrap";
import { limitarCantidad } from "../utils/carrito";

// Control de cantidad con botones − / + y campo numérico. Nunca baja de 1 ni supera `max`.
export default function SelectorCantidad({ valor, onChange, max = 99, id = "cantidad", etiqueta = "Cantidad" }) {
  const cambiar = (nueva) => onChange(limitarCantidad(nueva, max));

  return (
    <InputGroup style={{ maxWidth: 150 }}>
      <Button variant="outline-secondary" aria-label="Disminuir cantidad" disabled={valor <= 1} onClick={() => cambiar(valor - 1)}>
        <i className="bi bi-dash"></i>
      </Button>
      <Form.Control
        id={id}
        type="number"
        min={1}
        max={max}
        aria-label={etiqueta}
        className="text-center"
        value={valor}
        onChange={(e) => cambiar(e.target.value)}
      />
      <Button variant="outline-secondary" aria-label="Aumentar cantidad" disabled={valor >= max} onClick={() => cambiar(valor + 1)}>
        <i className="bi bi-plus"></i>
      </Button>
    </InputGroup>
  );
}
