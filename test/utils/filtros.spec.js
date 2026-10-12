import { aplicarFiltros, OPCIONES_ORDEN, porcentajeDescuento } from "../../src/utils/filtros";

const productos = [
  { id: 1, nombre: "Baby Triceratops", descripcion: "Cría dócil", precio: 100000, precioOferta: 80000, precioFinal: 80000, enOferta: true, categoriaId: 1 },
  { id: 2, nombre: "Peluche Carnotaurus", descripcion: "Suave", precio: 15000, precioOferta: null, precioFinal: 15000, enOferta: false, categoriaId: 2 },
  { id: 3, nombre: "Árbol de juego", descripcion: "Para trepar", precio: 50000, precioOferta: null, precioFinal: 50000, enOferta: false, categoriaId: 2 },
];

describe("filtros de productos", () => {
  it("sin filtros devuelve todo", () => {
    expect(aplicarFiltros(productos).length).toBe(3);
  });
  it("busca por nombre o descripción ignorando mayúsculas y tildes", () => {
    expect(aplicarFiltros(productos, { q: "ARBOL" }).map((p) => p.id)).toEqual([3]);
    expect(aplicarFiltros(productos, { q: "cria" }).map((p) => p.id)).toEqual([1]);
    expect(aplicarFiltros(productos, { q: "zzz" })).toEqual([]);
  });
  it("filtra por categoría (acepta número o texto)", () => {
    expect(aplicarFiltros(productos, { categoria: 2 }).length).toBe(2);
    expect(aplicarFiltros(productos, { categoria: "1" }).length).toBe(1);
  });
  it("filtra solo ofertas", () => {
    expect(aplicarFiltros(productos, { soloOfertas: true }).map((p) => p.id)).toEqual([1]);
  });
  it("filtra por rango de precio final", () => {
    expect(aplicarFiltros(productos, { precioMin: 20000, precioMax: 60000 }).map((p) => p.id)).toEqual([3]);
    expect(aplicarFiltros(productos, { precioMax: 15000 }).map((p) => p.id)).toEqual([2]);
  });
  it("ordena por precio y nombre sin alterar la lista original", () => {
    expect(aplicarFiltros(productos, { orden: "precio-asc" }).map((p) => p.id)).toEqual([2, 3, 1]);
    expect(aplicarFiltros(productos, { orden: "precio-desc" }).map((p) => p.id)).toEqual([1, 3, 2]);
    expect(aplicarFiltros(productos, { orden: "nombre" }).map((p) => p.id)).toEqual([3, 1, 2]);
    expect(productos.map((p) => p.id)).toEqual([1, 2, 3]);
  });
  it("combina varios filtros", () => {
    expect(aplicarFiltros(productos, { categoria: 2, precioMax: 20000, orden: "nombre" }).map((p) => p.id)).toEqual([2]);
  });
  it("expone las opciones de orden", () => {
    expect(OPCIONES_ORDEN.map((o) => o.valor)).toEqual(["relevancia", "precio-asc", "precio-desc", "nombre"]);
  });
  it("calcula el porcentaje de descuento", () => {
    expect(porcentajeDescuento(productos[0])).toBe(20);
    expect(porcentajeDescuento(productos[1])).toBe(0);
  });
});
