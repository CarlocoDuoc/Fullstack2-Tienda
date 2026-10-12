import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BadgeEstadoOrden from "../../src/components/BadgeEstadoOrden";
import FormField from "../../src/components/FormField";
import GrillaProductos from "../../src/components/GrillaProductos";
import MensajeError from "../../src/components/MensajeError";
import PrecioProducto from "../../src/components/PrecioProducto";
import SelectorCantidad from "../../src/components/SelectorCantidad";
import TarjetaProducto from "../../src/components/TarjetaProducto";

const producto = (extra = {}) => ({
  id: 1,
  nombre: "Baby Triceratops",
  descripcion: "Cría dócil",
  precio: 100000,
  precioOferta: null,
  precioFinal: 100000,
  enOferta: false,
  imagen: "",
  stock: 5,
  ...extra,
});

const enRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("SelectorCantidad", () => {
  it("aumenta y disminuye con los botones", () => {
    const onChange = jasmine.createSpy("onChange");
    render(<SelectorCantidad valor={2} onChange={onChange} max={5} />);
    fireEvent.click(screen.getByLabelText("Aumentar cantidad"));
    expect(onChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByLabelText("Disminuir cantidad"));
    expect(onChange).toHaveBeenCalledWith(1);
  });
  it("deshabilita − en 1 y + en el máximo", () => {
    const { rerender } = render(<SelectorCantidad valor={1} onChange={() => {}} max={3} />);
    expect(screen.getByLabelText("Disminuir cantidad").disabled).toBeTrue();
    rerender(<SelectorCantidad valor={3} onChange={() => {}} max={3} />);
    expect(screen.getByLabelText("Aumentar cantidad").disabled).toBeTrue();
  });
  it("limita lo que se escribe al stock disponible", () => {
    const onChange = jasmine.createSpy("onChange");
    render(<SelectorCantidad valor={1} onChange={onChange} max={4} />);
    fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: "50" } });
    expect(onChange).toHaveBeenCalledWith(4);
  });
});

describe("PrecioProducto", () => {
  it("muestra solo el precio normal sin oferta", () => {
    const { container } = render(<PrecioProducto producto={producto()} />);
    expect(container.textContent).toContain("100");
    expect(container.querySelector("del")).toBeNull();
  });
  it("con oferta tacha el precio y muestra el descuento", () => {
    const { container } = render(<PrecioProducto producto={producto({ enOferta: true, precioOferta: 80000, precioFinal: 80000 })} />);
    expect(container.querySelector("del")).not.toBeNull();
    expect(container.textContent).toContain("-20%");
  });
});

describe("MensajeError", () => {
  it("muestra el mensaje y permite reintentar", () => {
    const reintentar = jasmine.createSpy("reintentar");
    render(<MensajeError error={new Error("Falló la carga")} onReintentar={reintentar} />);
    expect(screen.getByRole("alert").textContent).toContain("Falló la carga");
    fireEvent.click(screen.getByText("Reintentar"));
    expect(reintentar).toHaveBeenCalled();
  });
  it("sin onReintentar no muestra el botón", () => {
    render(<MensajeError error="Error simple" />);
    expect(screen.queryByText("Reintentar")).toBeNull();
  });
});

describe("TarjetaProducto", () => {
  it("muestra nombre, descripción y agrega al carrito", () => {
    const onAgregar = jasmine.createSpy("onAgregar");
    const p = producto();
    enRouter(<TarjetaProducto producto={p} onAgregar={onAgregar} />);
    expect(screen.getAllByText("Baby Triceratops").length).toBeGreaterThan(0);
    expect(screen.getByText("Cría dócil")).toBeTruthy();
    fireEvent.click(screen.getByText("Agregar al carrito"));
    expect(onAgregar).toHaveBeenCalledWith(p);
  });
  it("si no hay stock deshabilita el botón y muestra Agotado", () => {
    enRouter(<TarjetaProducto producto={producto({ stock: 0 })} onAgregar={() => {}} />);
    expect(screen.getByText("Agotado")).toBeTruthy();
    expect(screen.getByText("Sin stock").closest("button").disabled).toBeTrue();
  });
  it("marca los productos en oferta", () => {
    enRouter(<TarjetaProducto producto={producto({ enOferta: true, precioOferta: 5, precioFinal: 5 })} />);
    expect(screen.getByText("Oferta")).toBeTruthy();
  });
});

describe("GrillaProductos", () => {
  it("renderiza una tarjeta por producto", () => {
    enRouter(<GrillaProductos productos={[producto({ id: 1, nombre: "A" }), producto({ id: 2, nombre: "B" })]} />);
    expect(screen.getAllByText("Ver detalle").length).toBe(2);
  });
  it("muestra el mensaje vacío", () => {
    enRouter(<GrillaProductos productos={[]} vacio="Nada por aquí" />);
    expect(screen.getByText("Nada por aquí")).toBeTruthy();
  });
});

describe("BadgeEstadoOrden", () => {
  it("usa verde para Pagada y rojo para Pago fallido", () => {
    const { container, rerender } = render(<BadgeEstadoOrden estado="Pagada" />);
    expect(container.querySelector(".bg-success")).not.toBeNull();
    rerender(<BadgeEstadoOrden estado="Pago fallido" />);
    expect(container.querySelector(".bg-danger")).not.toBeNull();
  });
});

describe("FormField", () => {
  it("muestra el error solo si el campo fue tocado", () => {
    const { rerender } = render(<FormField id="x" name="x" label="Nombre" error="Obligatorio" touched={false} />);
    expect(screen.getByLabelText("Nombre").className).not.toContain("is-invalid");
    rerender(<FormField id="x" name="x" label="Nombre" error="Obligatorio" touched />);
    expect(screen.getByLabelText("Nombre").className).toContain("is-invalid");
  });
  it("marca como válido un campo tocado sin error", () => {
    render(<FormField id="x" name="x" label="Nombre" error="" touched />);
    expect(screen.getByLabelText("Nombre").className).toContain("is-valid");
  });
  it("agrega * a los campos obligatorios", () => {
    render(<FormField id="x" name="x" label="Correo" required />);
    expect(screen.getByText("Correo *")).toBeTruthy();
  });
});
