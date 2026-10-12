import {
  calcularEdad,
  tieneErrores,
  validarConfirmPassword,
  validarCorreo,
  validarCorreoGeneral,
  validarUsuario,
  validarEntero,
  validarFechaNacimiento,
  validarFormularioCheckout,
  validarFormularioContacto,
  validarFormularioLogin,
  validarFormularioProducto,
  validarFormularioRegistro,
  validarImagen,
  validarNombre,
  validarPassword,
  validarPrecio,
  validarPrecioOferta,
  validarTerminos,
} from "../../src/utils/validaciones";

describe("validaciones", () => {
  describe("validarNombre", () => {
    it("rechaza vacío y solo espacios", () => {
      expect(validarNombre("")).toContain("obligatorio");
      expect(validarNombre("   ")).toContain("obligatorio");
    });
    it("rechaza más de 50 caracteres", () => {
      expect(validarNombre("a".repeat(51))).toContain("50");
    });
    it("acepta un nombre válido", () => {
      expect(validarNombre("Carl Rivas")).toBe("");
    });
  });

  describe("correos", () => {
    it("acepta cualquier dominio con formato válido", () => {
      expect(validarCorreo("a@duocuc.cl")).toBe("");
      expect(validarCorreo("a@gmail.com")).toBe("");
      expect(validarCorreo("admin@dinorancho.cl")).toBe("");
    });
    it("rechaza vacío, sin arroba o demasiado largo", () => {
      expect(validarCorreo("")).toContain("obligatorio");
      expect(validarCorreo("sin-arroba")).toContain("formato");
      expect(validarCorreo("ana@")).toContain("formato");
      expect(validarCorreo("a".repeat(97) + "@x.cl")).toContain("100");
    });
    it("validarCorreoGeneral se comporta igual", () => {
      expect(validarCorreoGeneral("ana@gmail.com")).toBe("");
      expect(validarCorreoGeneral("ana@")).toContain("formato");
    });
  });

  describe("validarUsuario", () => {
    it("acepta nombres simples como admin", () => {
      expect(validarUsuario("admin")).toBe("");
      expect(validarUsuario("dino_fan.01")).toBe("");
    });
    it("rechaza vacío, muy corto, muy largo o con espacios y símbolos", () => {
      expect(validarUsuario("")).toContain("obligatorio");
      expect(validarUsuario("ab")).toContain("entre 3 y 30");
      expect(validarUsuario("a".repeat(31))).toContain("entre 3 y 30");
      expect(validarUsuario("con espacio")).toContain("Solo se permiten");
      expect(validarUsuario("a@b.cl")).toContain("Solo se permiten");
    });
  });

  describe("fecha de nacimiento", () => {
    const hoy = new Date(2026, 5, 15); // 15-jun-2026
    it("calcula la edad considerando el cumpleaños", () => {
      expect(calcularEdad("2000-06-15", hoy)).toBe(26);
      expect(calcularEdad("2000-06-16", hoy)).toBe(25);
    });
    it("exige ser mayor de 18", () => {
      expect(validarFechaNacimiento("2010-01-01", hoy)).toContain("18");
      expect(validarFechaNacimiento("2000-01-01", hoy)).toBe("");
      expect(validarFechaNacimiento("", hoy)).toContain("obligatoria");
    });
  });

  describe("contraseña", () => {
    it("exige entre 4 y 10 caracteres", () => {
      expect(validarPassword("abc")).toContain("entre 4 y 10");
      expect(validarPassword("a".repeat(11))).toContain("entre 4 y 10");
      expect(validarPassword("clave1234")).toBe("");
      expect(validarPassword("")).toContain("obligatoria");
    });
    it("la confirmación debe coincidir", () => {
      expect(validarConfirmPassword("abcd", "abcd")).toBe("");
      expect(validarConfirmPassword("abcd", "abce")).toContain("no coinciden");
      expect(validarConfirmPassword("abcd", "")).toContain("confirmar");
    });
    it("los términos deben estar aceptados", () => {
      expect(validarTerminos(true)).toBe("");
      expect(validarTerminos(false)).toContain("términos");
    });
  });

  describe("precios y stock", () => {
    it("validarPrecio exige un entero positivo", () => {
      expect(validarPrecio("")).toContain("obligatorio");
      expect(validarPrecio(0)).toContain("mayor a 0");
      expect(validarPrecio("-5")).toContain("mayor a 0");
      expect(validarPrecio("10.5")).toContain("entero");
      expect(validarPrecio("abc")).toContain("mayor a 0");
      expect(validarPrecio(9990)).toBe("");
    });
    it("la oferta es opcional y debe ser menor al precio", () => {
      expect(validarPrecioOferta("", 1000)).toBe("");
      expect(validarPrecioOferta("800", 1000)).toBe("");
      expect(validarPrecioOferta("1000", 1000)).toContain("menor");
      expect(validarPrecioOferta("1200", 1000)).toContain("menor");
    });
    it("validarEntero acepta 0 pero no negativos ni decimales", () => {
      expect(validarEntero("0", "El stock")).toBe("");
      expect(validarEntero("-1", "El stock")).toContain("igual o mayor a 0");
      expect(validarEntero("1.5", "El stock")).toContain("entero");
      expect(validarEntero("", "El stock")).toContain("obligatorio");
    });
  });

  describe("imagen", () => {
    it("acepta imágenes pequeñas y rechaza otros tipos o tamaños", () => {
      expect(validarImagen({ type: "image/png", size: 1000 })).toBe("");
      expect(validarImagen({ type: "application/pdf", size: 1000 })).toContain("imagen");
      expect(validarImagen({ type: "image/png", size: 600 * 1024 })).toContain("512 KB");
    });
  });

  describe("validadores de formulario", () => {
    it("login exige usuario y contraseña pero acepta cualquier texto (sin formato de correo)", () => {
      expect(tieneErrores(validarFormularioLogin({ usuario: "admin", password: "1234" }))).toBeFalse();
      expect(validarFormularioLogin({ usuario: "  ", password: "x" }).usuario).toBeTruthy();
      expect(validarFormularioLogin({ usuario: "admin", password: "" }).password).toBeTruthy();
    });
    it("registro", () => {
      const ok = { nombre: "Ana", usuario: "ana_01", fechaNacimiento: "2000-01-01", password: "abcd", confirmPassword: "abcd", terminos: true };
      expect(tieneErrores(validarFormularioRegistro(ok))).toBeFalse();
      expect(validarFormularioRegistro({ ...ok, terminos: false }).terminos).toBeTruthy();
      expect(validarFormularioRegistro({ ...ok, confirmPassword: "x" }).confirmPassword).toBeTruthy();
    });
    it("producto", () => {
      const ok = { nombre: "Rex", precio: "1000", precioOferta: "", stock: "3", stockCritico: "5", descripcion: "Desc" };
      expect(tieneErrores(validarFormularioProducto(ok))).toBeFalse();
      expect(validarFormularioProducto({ ...ok, precioOferta: "2000" }).precioOferta).toBeTruthy();
      expect(validarFormularioProducto({ ...ok, stock: "-1" }).stock).toBeTruthy();
    });
    it("checkout exige región y comuna", () => {
      const v = { nombre: "Ana", apellidos: "Soto", correo: "a@b.cl", calle: "Calle 1", departamento: "", region: "", comuna: "", indicaciones: "" };
      const errores = validarFormularioCheckout(v);
      expect(errores.region).toBeTruthy();
      expect(errores.comuna).toBeTruthy();
      expect(tieneErrores(validarFormularioCheckout({ ...v, region: "Maule", comuna: "Talca" }))).toBeFalse();
    });
    it("contacto", () => {
      expect(tieneErrores(validarFormularioContacto({ nombre: "A", correo: "a@b.cl", asunto: "Hola", mensaje: "Texto" }))).toBeFalse();
      expect(validarFormularioContacto({ nombre: "A", correo: "a@b.cl", asunto: "", mensaje: "" }).mensaje).toBeTruthy();
    });
  });
});
