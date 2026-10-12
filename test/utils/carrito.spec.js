import {
  CLAVE_CARRITO,
  carritoReducer,
  guardarCarrito,
  leerCarrito,
  limitarCantidad,
  totalCarrito,
  unidadesCarrito,
} from "../../src/utils/carrito";

const rex = { id: 1, nombre: "Rex", imagen: "img/rex.jpg", precioFinal: 1000, stock: 5 };
const bebe = { id: 2, nombre: "Bebé", imagen: "", precioFinal: 500, stock: 2 };

// Almacén falso con la misma interfaz que localStorage
const crearAlmacen = (inicial = {}) => {
  const datos = { ...inicial };
  return {
    getItem: (k) => (k in datos ? datos[k] : null),
    setItem: (k, v) => {
      datos[k] = String(v);
    },
  };
};

describe("carrito", () => {
  describe("limitarCantidad", () => {
    it("nunca baja de 1", () => {
      expect(limitarCantidad(0, 5)).toBe(1);
      expect(limitarCantidad(-3, 5)).toBe(1);
      expect(limitarCantidad("abc", 5)).toBe(1);
    });
    it("no supera el stock ni el límite de 99", () => {
      expect(limitarCantidad(10, 5)).toBe(5);
      expect(limitarCantidad(500, 1000)).toBe(99);
    });
    it("trunca decimales", () => {
      expect(limitarCantidad(2.9, 5)).toBe(2);
    });
  });

  describe("carritoReducer", () => {
    it("agrega un producto nuevo", () => {
      const estado = carritoReducer([], { tipo: "agregar", producto: rex, cantidad: 2 });
      expect(estado.length).toBe(1);
      expect(estado[0]).toEqual({ productoId: 1, nombre: "Rex", imagen: "img/rex.jpg", precio: 1000, stock: 5, cantidad: 2 });
    });
    it("suma la cantidad si el producto ya está", () => {
      let estado = carritoReducer([], { tipo: "agregar", producto: rex, cantidad: 2 });
      estado = carritoReducer(estado, { tipo: "agregar", producto: rex, cantidad: 1 });
      expect(estado.length).toBe(1);
      expect(estado[0].cantidad).toBe(3);
    });
    it("no permite superar el stock al agregar", () => {
      let estado = carritoReducer([], { tipo: "agregar", producto: bebe, cantidad: 2 });
      estado = carritoReducer(estado, { tipo: "agregar", producto: bebe, cantidad: 5 });
      expect(estado[0].cantidad).toBe(2);
    });
    it("ignora productos agotados", () => {
      const estado = carritoReducer([], { tipo: "agregar", producto: { ...rex, stock: 0 }, cantidad: 1 });
      expect(estado).toEqual([]);
    });
    it("cambia la cantidad respetando los límites", () => {
      const base = carritoReducer([], { tipo: "agregar", producto: rex, cantidad: 1 });
      expect(carritoReducer(base, { tipo: "cambiar", productoId: 1, cantidad: 4 })[0].cantidad).toBe(4);
      expect(carritoReducer(base, { tipo: "cambiar", productoId: 1, cantidad: 50 })[0].cantidad).toBe(5);
      expect(carritoReducer(base, { tipo: "cambiar", productoId: 1, cantidad: 0 })[0].cantidad).toBe(1);
    });
    it("quita y vacía", () => {
      let estado = carritoReducer([], { tipo: "agregar", producto: rex, cantidad: 1 });
      estado = carritoReducer(estado, { tipo: "agregar", producto: bebe, cantidad: 1 });
      estado = carritoReducer(estado, { tipo: "quitar", productoId: 1 });
      expect(estado.map((i) => i.productoId)).toEqual([2]);
      expect(carritoReducer(estado, { tipo: "vaciar" })).toEqual([]);
    });
    it("no muta el estado anterior", () => {
      const base = carritoReducer([], { tipo: "agregar", producto: rex, cantidad: 1 });
      const copia = JSON.parse(JSON.stringify(base));
      carritoReducer(base, { tipo: "cambiar", productoId: 1, cantidad: 3 });
      expect(base).toEqual(copia);
    });
    it("una acción desconocida deja el estado igual", () => {
      const base = [];
      expect(carritoReducer(base, { tipo: "otra" })).toBe(base);
    });
  });

  describe("totales", () => {
    it("suma precio × cantidad y unidades", () => {
      const items = [
        { productoId: 1, precio: 1000, cantidad: 2 },
        { productoId: 2, precio: 500, cantidad: 3 },
      ];
      expect(totalCarrito(items)).toBe(3500);
      expect(unidadesCarrito(items)).toBe(5);
      expect(totalCarrito([])).toBe(0);
    });
  });

  describe("persistencia", () => {
    it("guarda y vuelve a leer el carrito", () => {
      const almacen = crearAlmacen();
      const items = carritoReducer([], { tipo: "agregar", producto: rex, cantidad: 2 });
      guardarCarrito(items, almacen);
      expect(leerCarrito(almacen)).toEqual(items);
    });
    it("devuelve [] si no hay datos o están corruptos", () => {
      expect(leerCarrito(crearAlmacen())).toEqual([]);
      expect(leerCarrito(crearAlmacen({ [CLAVE_CARRITO]: "{no es json" }))).toEqual([]);
      expect(leerCarrito(crearAlmacen({ [CLAVE_CARRITO]: '{"a":1}' }))).toEqual([]);
    });
    it("descarta líneas inválidas", () => {
      const crudo = JSON.stringify([{ productoId: 1, nombre: "A", precio: 10, cantidad: 1, stock: 3 }, { productoId: "x" }, null, { productoId: 2, precio: 5, cantidad: 0 }]);
      const leidos = leerCarrito(crearAlmacen({ [CLAVE_CARRITO]: crudo }));
      expect(leidos.length).toBe(1);
      expect(leidos[0].productoId).toBe(1);
    });
  });
});
