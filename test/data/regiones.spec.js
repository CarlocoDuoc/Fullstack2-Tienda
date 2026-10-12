import { comunasDe, nombresRegiones, regiones } from "../../src/data/regiones";

describe("regiones y comunas", () => {
  it("incluye las 16 regiones de Chile", () => {
    expect(regiones.length).toBe(16);
    expect(nombresRegiones.length).toBe(16);
  });
  it("la Región Metropolitana tiene 52 comunas", () => {
    expect(comunasDe("Región Metropolitana de Santiago").length).toBe(52);
  });
  it("devuelve [] para una región desconocida o vacía", () => {
    expect(comunasDe("Atlántida")).toEqual([]);
    expect(comunasDe("")).toEqual([]);
  });
  it("no repite comunas dentro de una región", () => {
    regiones.forEach((r) => expect(new Set(r.comunas).size).toBe(r.comunas.length));
  });
});
