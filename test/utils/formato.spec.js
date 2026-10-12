import { enlaceCorreoBoleta, guardarUltimaOrden, leerUltimaOrden } from "../../src/utils/boleta";
import { formatearFecha, formatearFechaHora, formatearPrecio } from "../../src/utils/formato";
import { IMG_PLACEHOLDER, rutaImagen } from "../../src/utils/imagenes";
import { dividirEnGrupos } from "../../src/utils/listas";

const crearAlmacen = () => {
  const datos = {};
  return {
    getItem: (k) => (k in datos ? datos[k] : null),
    setItem: (k, v) => {
      datos[k] = String(v);
    },
  };
};

describe("formato", () => {
  it("formatearPrecio usa $ y separador de miles", () => {
    expect(formatearPrecio(0)).toBe("$0");
    expect(formatearPrecio(12990)).toMatch(/^\$12[.,\s]?990$/);
  });
  it("formatearFecha invierte año-mes-día", () => {
    expect(formatearFecha("1995-06-15")).toBe("15/06/1995");
    expect(formatearFecha("1995-06-15T00:00:00.000Z")).toBe("15/06/1995");
    expect(formatearFecha("")).toBe("N/A");
  });
  it("formatearFechaHora maneja fechas inválidas", () => {
    expect(formatearFechaHora("no es fecha")).toBe("N/A");
    expect(formatearFechaHora(null)).toBe("N/A");
    expect(formatearFechaHora("2026-10-08T15:30:00")).toBe("08/10/2026 15:30");
  });
});

describe("listas", () => {
  it("dividirEnGrupos reparte en bloques del tamaño pedido", () => {
    expect(dividirEnGrupos([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect(dividirEnGrupos([], 3)).toEqual([]);
  });
});

describe("imagenes", () => {
  it("usa el placeholder cuando no hay ruta", () => {
    expect(rutaImagen("")).toBe(IMG_PLACEHOLDER);
    expect(rutaImagen(undefined)).toBe(IMG_PLACEHOLDER);
  });
  it("deja intactas las data URL y las URL absolutas", () => {
    expect(rutaImagen("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA");
    expect(rutaImagen("https://x.cl/a.png")).toBe("https://x.cl/a.png");
  });
  it("antepone la carpeta base a las rutas relativas", () => {
    expect(rutaImagen("img/rex.jpg")).toMatch(/img\/rex\.jpg$/);
    expect(rutaImagen("/img/rex.jpg")).not.toContain("//img");
  });
});

describe("boleta", () => {
  const orden = {
    codigo: "DR-20261008-12345",
    total: 3000,
    cliente: { correo: "ana@gmail.com" },
    items: [{ nombre: "Rex", cantidad: 2, subtotal: 2000 }],
  };
  it("guarda y lee la última orden", () => {
    const almacen = crearAlmacen();
    expect(leerUltimaOrden(almacen)).toBeNull();
    guardarUltimaOrden(orden, almacen);
    expect(leerUltimaOrden(almacen)).toEqual(orden);
  });
  it("arma el enlace mailto con código y total", () => {
    const enlace = enlaceCorreoBoleta(orden);
    expect(enlace.startsWith("mailto:ana%40gmail.com")).toBeTrue();
    expect(decodeURIComponent(enlace)).toContain("DR-20261008-12345");
    expect(decodeURIComponent(enlace)).toContain("Rex x2");
  });
});
