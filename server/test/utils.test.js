import assert from "node:assert/strict";
import { test } from "node:test";
import { generarCodigoOrden } from "../src/utils/codigoOrden.js";
import { calcularTotal } from "../src/utils/mapeos.js";
import { armarLineas, prepararOrden } from "../src/utils/ordenes.js";
import {
  calcularEdad, soloErrores, validarCorreo, validarCorreoGeneral, validarFechaNacimiento, validarPassword, validarPrecio, validarUsuario,
} from "../src/utils/validaciones.js";

const cuerpo = (extra = {}) => ({
  cliente: { nombre: "Ana", apellidos: "Soto", correo: "ana@gmail.com" },
  direccion: { calle: "Calle 1", region: "RM", comuna: "Santiago" },
  items: [{ productoId: 1, cantidad: 2 }, { productoId: 1, cantidad: 1 }],
  ...extra,
});

test("el usuario acepta nombres simples y rechaza espacios o símbolos", () => {
  assert.equal(validarUsuario("admin"), "");
  assert.equal(validarUsuario("dino_fan.01"), "");
  assert.notEqual(validarUsuario("ab"), "");
  assert.notEqual(validarUsuario("con espacio"), "");
  assert.notEqual(validarUsuario("a@b.cl"), "");
});

test("el correo (contacto y compra) acepta cualquier dominio con formato válido", () => {
  assert.equal(validarCorreo("a@duocuc.cl"), "");
  assert.equal(validarCorreo("a@gmail.com"), "");
  assert.notEqual(validarCorreo("sin-arroba"), "");
  assert.equal(validarCorreoGeneral("a@gmail.com"), "");
  assert.notEqual(validarCorreoGeneral("sin-arroba"), "");
});

test("contraseña y fecha de nacimiento", () => {
  assert.notEqual(validarPassword("123"), "");
  assert.equal(validarPassword("clave1234"), "");
  assert.equal(calcularEdad("2000-06-15", new Date("2026-06-14")), 25);
  assert.notEqual(validarFechaNacimiento("2015-01-01", new Date("2026-01-01")), "");
  assert.equal(validarFechaNacimiento("2000-01-01", new Date("2026-01-01")), "");
});

test("precio opcional y soloErrores", () => {
  assert.equal(validarPrecio("", { opcional: true }), "");
  assert.notEqual(validarPrecio(0), "");
  assert.equal(soloErrores({ a: "", b: "" }), null);
  assert.deepEqual(soloErrores({ a: "x", b: "" }), { a: "x" });
});

test("código de orden tiene formato DR-AAAAMMDD-NNNNN", () => {
  assert.match(generarCodigoOrden(new Date("2026-10-08T12:00:00Z")), /^DR-20261008-\d{5}$/);
});

test("prepararOrden une líneas repetidas y asume pago aprobado", () => {
  const r = prepararOrden(cuerpo());
  assert.deepEqual(r.items, [{ productoId: 1, cantidad: 3 }]);
  assert.equal(r.pagoAprobado, true);
  assert.equal(prepararOrden(cuerpo({ pago: { resultado: "rechazado" } })).pagoAprobado, false);
});

test("prepararOrden rechaza carrito vacío y cantidades inválidas", () => {
  assert.throws(() => prepararOrden(cuerpo({ items: [] })), { estado: 400 });
  assert.throws(() => prepararOrden(cuerpo({ items: [{ productoId: 1, cantidad: 0 }] })), { estado: 400 });
  assert.throws(() => prepararOrden(cuerpo({ pago: { resultado: "x" } })), { estado: 400 });
  assert.throws(() => prepararOrden(cuerpo({ cliente: {} })), { estado: 400 });
});

test("armarLineas usa precio de la base y valida stock", () => {
  const productos = [{ id: 1, nombre: "A", imagen: "i", stock: 5, precio_final: 1000 }];
  const { lineas, total } = armarLineas([{ productoId: 1, cantidad: 3 }], productos);
  assert.equal(total, 3000);
  assert.equal(lineas[0].precioUnitario, 1000);
  assert.throws(() => armarLineas([{ productoId: 1, cantidad: 6 }], productos), { estado: 409 });
  assert.throws(() => armarLineas([{ productoId: 9, cantidad: 1 }], productos), { estado: 409 });
});

test("calcularTotal suma precio × cantidad", () => {
  assert.equal(calcularTotal([{ precioUnitario: 500, cantidad: 2 }, { precioUnitario: 100, cantidad: 1 }]), 1100);
});
