import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BoletaView from "../../src/components/BoletaView";
import TablaOrdenes from "../../src/components/TablaOrdenes";

const orden = {
  id: 7,
  codigo: "DR-20261008-12345",
  estado: "Pagada",
  total: 31000,
  creadoEn: "2026-10-08T15:30:00",
  unidades: 3,
  cliente: { nombre: "Ana", apellidos: "Soto", correo: "ana@gmail.com" },
  direccion: { calle: "Calle 1 #123", departamento: "45", region: "Maule", comuna: "Talca", indicaciones: "Tocar timbre" },
  items: [
    { productoId: 1, nombre: "Rex", precioUnitario: 10000, cantidad: 2, subtotal: 20000 },
    { productoId: 2, nombre: "Pelota", precioUnitario: 11000, cantidad: 1, subtotal: 11000 },
  ],
};

describe("BoletaView", () => {
  it("muestra código, cliente, dirección y productos", () => {
    const { container } = render(<BoletaView orden={orden} />);
    expect(container.textContent).toContain("DR-20261008-12345");
    expect(container.textContent).toContain("Ana Soto");
    expect(container.textContent).toContain("Talca");
    expect(container.textContent).toContain("Tocar timbre");
    expect(screen.getByText("Rex")).toBeTruthy();
    expect(screen.getByText("Pelota")).toBeTruthy();
  });
  it("muestra el total y el estado", () => {
    const { container } = render(<BoletaView orden={orden} />);
    expect(container.textContent).toMatch(/\$31[.,\s]?000/);
    expect(screen.getByText("Pagada")).toBeTruthy();
  });
});

describe("TablaOrdenes", () => {
  const enlace = (o) => `/admin/ordenes/${o.id}`;
  it("lista las órdenes con su enlace de detalle", () => {
    render(
      <MemoryRouter>
        <TablaOrdenes ordenes={[orden]} enlace={enlace} mostrarCliente />
      </MemoryRouter>
    );
    expect(screen.getByText("DR-20261008-12345")).toBeTruthy();
    expect(screen.getByText("Ana Soto")).toBeTruthy();
    expect(screen.getByText("Ver").getAttribute("href")).toContain("/admin/ordenes/7");
  });
  it("muestra el mensaje cuando no hay órdenes", () => {
    render(
      <MemoryRouter>
        <TablaOrdenes ordenes={[]} enlace={enlace} vacio="Sin compras" />
      </MemoryRouter>
    );
    expect(screen.getByText("Sin compras")).toBeTruthy();
  });
});
