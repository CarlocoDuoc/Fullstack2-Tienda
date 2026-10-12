import { api, armarQuery, ApiError, borrarToken, guardarToken, obtenerToken } from "../../src/services/api";

// Respuesta simulada de fetch
const respuesta = (estado, cuerpo) => ({
  ok: estado >= 200 && estado < 300,
  status: estado,
  json: () => Promise.resolve(cuerpo),
});

describe("services/api", () => {
  beforeEach(() => borrarToken());
  afterEach(() => borrarToken());

  describe("armarQuery", () => {
    it("omite valores vacíos y codifica el resto", () => {
      expect(armarQuery({ q: "baby rex", oferta: true, vacio: "", nulo: null, no: false })).toBe("?q=baby%20rex&oferta=true");
      expect(armarQuery({})).toBe("");
    });
  });

  describe("token", () => {
    it("se guarda y se borra", () => {
      guardarToken("abc");
      expect(obtenerToken()).toBe("abc");
      borrarToken();
      expect(obtenerToken()).toBeNull();
    });
  });

  describe("peticiones", () => {
    it("GET devuelve el JSON de la respuesta", async () => {
      const espia = spyOn(window, "fetch").and.resolveTo(respuesta(200, [{ id: 1 }]));
      const datos = await api.productos.listar({ oferta: true });
      expect(datos).toEqual([{ id: 1 }]);
      const [url, opciones] = espia.calls.mostRecent().args;
      expect(url).toBe("/api/productos?oferta=true");
      expect(opciones.method).toBe("GET");
    });

    it("POST envía el cuerpo como JSON", async () => {
      const espia = spyOn(window, "fetch").and.resolveTo(respuesta(201, { ok: true }));
      await api.contacto.enviar({ nombre: "Ana" });
      const [url, opciones] = espia.calls.mostRecent().args;
      expect(url).toBe("/api/contacto");
      expect(opciones.method).toBe("POST");
      expect(opciones.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(opciones.body)).toEqual({ nombre: "Ana" });
    });

    it("envía el token como Bearer cuando hay sesión", async () => {
      guardarToken("tok123");
      const espia = spyOn(window, "fetch").and.resolveTo(respuesta(200, {}));
      await api.auth.me();
      expect(espia.calls.mostRecent().args[1].headers.Authorization).toBe("Bearer tok123");
    });

    it("no envía Authorization sin sesión", async () => {
      const espia = spyOn(window, "fetch").and.resolveTo(respuesta(200, {}));
      await api.auth.me();
      expect(espia.calls.mostRecent().args[1].headers.Authorization).toBeUndefined();
    });

    it("DELETE con 204 devuelve null", async () => {
      spyOn(window, "fetch").and.resolveTo({ ok: true, status: 204, json: () => Promise.reject(new Error("sin cuerpo")) });
      expect(await api.productos.eliminar(5)).toBeNull();
    });

    it("convierte un error HTTP en ApiError con estado y campos", async () => {
      spyOn(window, "fetch").and.resolveTo(respuesta(400, { error: "Revisa los campos.", campos: { correo: "Inválido" } }));
      try {
        await api.auth.registro({});
        fail("debía lanzar");
      } catch (error) {
        expect(error instanceof ApiError).toBeTrue();
        expect(error.estado).toBe(400);
        expect(error.message).toBe("Revisa los campos.");
        expect(error.campos).toEqual({ correo: "Inválido" });
      }
    });

    it("ante un 401 con sesión borra el token y avisa", async () => {
      guardarToken("vencido");
      const alExpirar = jasmine.createSpy("alExpirar");
      window.addEventListener("dino:sesion-expirada", alExpirar);
      spyOn(window, "fetch").and.resolveTo(respuesta(401, { error: "Tu sesión expiró." }));
      await expectAsync(api.auth.me()).toBeRejected();
      expect(obtenerToken()).toBeNull();
      expect(alExpirar).toHaveBeenCalled();
      window.removeEventListener("dino:sesion-expirada", alExpirar);
    });

    it("si no hay red lanza un ApiError con estado 0", async () => {
      spyOn(window, "fetch").and.rejectWith(new TypeError("Failed to fetch"));
      try {
        await api.productos.listar();
        fail("debía lanzar");
      } catch (error) {
        expect(error.estado).toBe(0);
        expect(error.message).toContain("conectar");
      }
    });

    it("una compra se envía a /api/ordenes", async () => {
      const espia = spyOn(window, "fetch").and.resolveTo(respuesta(201, { id: 1 }));
      await api.ordenes.crear({ items: [] });
      expect(espia.calls.mostRecent().args[0]).toBe("/api/ordenes");
    });
  });
});
