import { act, fireEvent, render, screen } from "@testing-library/react";
import { CartProvider, useCart } from "../../src/context/CartContext";
import { CLAVE_CARRITO } from "../../src/utils/carrito";
import { sinErrorGlobal } from "../ayudas";

const rex = { id: 1, nombre: "Rex", imagen: "", precioFinal: 1000, stock: 3 };

// Componente de prueba que expone el carrito en pantalla
function Sonda() {
  const { items, total, unidades, aviso, agregar, cambiarCantidad, quitar, vaciar } = useCart();
  return (
    <div>
      <span data-testid="unidades">{unidades}</span>
      <span data-testid="total">{total}</span>
      <span data-testid="lineas">{items.length}</span>
      <span data-testid="aviso">{aviso?.mensaje ?? ""}</span>
      <button onClick={() => agregar(rex, 2)}>agregar</button>
      <button onClick={() => agregar({ ...rex, id: 9, stock: 0 })}>agotado</button>
      <button onClick={() => cambiarCantidad(1, 3)}>cambiar</button>
      <button onClick={() => quitar(1)}>quitar</button>
      <button onClick={() => vaciar()}>vaciar</button>
    </div>
  );
}

const montar = () =>
  render(
    <CartProvider>
      <Sonda />
    </CartProvider>
  );

describe("CartContext", () => {
  beforeEach(() => localStorage.removeItem(CLAVE_CARRITO));
  afterEach(() => localStorage.removeItem(CLAVE_CARRITO));

  it("agrega productos, calcula totales y muestra aviso", () => {
    montar();
    fireEvent.click(screen.getByText("agregar"));
    expect(screen.getByTestId("unidades").textContent).toBe("2");
    expect(screen.getByTestId("total").textContent).toBe("2000");
    expect(screen.getByTestId("aviso").textContent).toContain("Rex");
  });
  it("respeta el stock al cambiar la cantidad", () => {
    montar();
    fireEvent.click(screen.getByText("agregar"));
    fireEvent.click(screen.getByText("cambiar"));
    expect(screen.getByTestId("unidades").textContent).toBe("3");
    fireEvent.click(screen.getByText("agregar")); // ya hay 3 = stock
    expect(screen.getByTestId("unidades").textContent).toBe("3");
  });
  it("no agrega productos agotados y avisa", () => {
    montar();
    fireEvent.click(screen.getByText("agotado"));
    expect(screen.getByTestId("lineas").textContent).toBe("0");
    expect(screen.getByTestId("aviso").textContent).toContain("agotado");
  });
  it("quita y vacía", () => {
    montar();
    fireEvent.click(screen.getByText("agregar"));
    fireEvent.click(screen.getByText("quitar"));
    expect(screen.getByTestId("lineas").textContent).toBe("0");
    fireEvent.click(screen.getByText("agregar"));
    fireEvent.click(screen.getByText("vaciar"));
    expect(screen.getByTestId("unidades").textContent).toBe("0");
  });
  it("guarda el carrito en localStorage y lo recupera al montar de nuevo", () => {
    const primero = montar();
    fireEvent.click(screen.getByText("agregar"));
    expect(JSON.parse(localStorage.getItem(CLAVE_CARRITO)).length).toBe(1);
    primero.unmount();
    montar();
    expect(screen.getByTestId("unidades").textContent).toBe("2");
  });
  it("useCart fuera del proveedor lanza un error claro", () => {
    spyOn(console, "error"); // React registra el error en consola
    sinErrorGlobal(() => expect(() => render(<Sonda />)).toThrowError(/CartProvider/));
  });
});
