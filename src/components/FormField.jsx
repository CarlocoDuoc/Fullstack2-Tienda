import { Form } from "react-bootstrap";

// Campo de formulario con etiqueta, validación visual y mensaje de error.
// `as="select"` muestra una lista desplegable (pasa las opciones como children).
export default function FormField({ id, label, name, as, error, touched, required, ayuda, children, ...resto }) {
  const invalido = Boolean(touched && error);
  const valido = Boolean(touched && !error);
  const Control = as === "select" ? Form.Select : Form.Control;
  const propsControl = as === "select" ? {} : { as };

  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label className="fw-semibold">
        {label}
        {required && " *"}
      </Form.Label>
      <Control name={name} isInvalid={invalido} isValid={valido} {...propsControl} {...resto}>
        {children}
      </Control>
      {ayuda && <Form.Text muted>{ayuda}</Form.Text>}
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
}
