import { Button, Modal } from "react-bootstrap";

export default function ModalConfirmacion({
  show,
  titulo,
  mensaje,
  textoConfirmar = "Eliminar",
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal show={show} onHide={onCancelar} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h5">{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{mensaje}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirmar}>
          {textoConfirmar}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
