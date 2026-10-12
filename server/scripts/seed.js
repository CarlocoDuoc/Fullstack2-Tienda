// Carga datos de ejemplo. Uso: npm run db:seed   (o con --reset para vaciar las tablas antes)
import bcrypt from "bcryptjs";
import { getPool } from "../src/db.js";

const reset = process.argv.includes("--reset");

const categorias = [
  { nombre: "Mascotas", descripcion: "Crías de dinosaurios y criaturas prehistóricas para tu hogar.", imagen: "img/babytrike.jpeg" },
  { nombre: "Juguetes", descripcion: "Peluches y juguetes para los más pequeños del rancho.", imagen: "img/Jugueteraptors.jpeg" },
  { nombre: "Accesorios", descripcion: "Todo lo necesario para cuidar a tu mascota prehistórica.", imagen: "img/TrikePelota.jpeg" },
];

// [nombre, descripcion, precio, oferta, imagen, destacado, stock, critico, categoria, ficha]
const productos = [
  ["Baby Triceratops", "Cría de triceratops, dócil y curiosa. Ideal para familias.", 89990, 79990, "img/babytrike.jpeg", true, 12, 3, "Mascotas", [["Edad", "3 meses"], ["Dieta", "Herbívora"]]],
  ["Baby Carnotaurus", "Cría de carnotauro, juguetona y muy activa.", 99990, null, "img/BabyCarno.jpeg", true, 8, 3, "Mascotas", [["Edad", "4 meses"], ["Dieta", "Carnívora"]]],
  ["Baby Onyx", "Cría de color oscuro, tranquila y fácil de cuidar.", 94990, 84990, "img/Babyonyx.jpeg", false, 5, 5, "Mascotas", [["Edad", "2 meses"]]],
  ["Baby Spinosaurus", "Cría de espinosaurio, ama el agua.", 109990, null, "img/babyspinos2.jpeg", true, 4, 5, "Mascotas", [["Hábitat", "Semiacuático"]]],
  ["Baby Teryx Azul", "Cría de pterosaurio de plumaje azul.", 79990, null, "img/babyteryxazul.jpeg", false, 10, 3, "Mascotas", []],
  ["Microraptor", "Pequeño dinosaurio con plumas, perfecto para espacios chicos.", 59990, 49990, "img/microraptor.jpeg", true, 15, 4, "Mascotas", [["Tamaño", "Pequeño"]]],
  ["Peluche Velociraptor", "Peluche suave de velociraptor.", 14990, null, "img/juguerteVelociraptor.jpeg", false, 30, 5, "Juguetes", []],
  ["Peluche Carnotaurus", "Peluche de carnotauro con textura suave.", 15990, 12990, "img/jugueteCarno.jpeg", false, 25, 5, "Juguetes", []],
  ["Pack Raptors", "Set de juguetes raptors para coleccionar.", 19990, null, "img/Jugueteraptors.jpeg", false, 2, 5, "Juguetes", []],
  ["Pelota Triceratops", "Pelota resistente para jugar con tu mascota.", 7990, null, "img/TrikePelota.jpeg", false, 40, 8, "Accesorios", []],
  ["Pelota Triceratops XL", "Versión grande, apta para juego intenso.", 11990, 9990, "img/TrikePelota2.jpeg", false, 0, 5, "Accesorios", []],
];

// [nombre, apellidos, usuario, contraseña, nacimiento, rol, estado]
const usuarios = [
  ["Administrador", "", "admin", "1234", "1995-01-01", "Administrador", "Activo"],
  ["Owen", "Grady", "owen", "1234", "1984-06-15", "Cliente", "Activo"],
  ["Alan", "Grant", "alan", "1234", "1960-02-03", "Cliente", "Inactivo"],
];

// [indice usuario, estado, dias atrás, [[indice producto, cantidad]...]]
const ordenes = [
  [1, "Pagada", 1, [[0, 1], [9, 2]]],
  [1, "Pagada", 3, [[5, 1]]],
  [1, "Pago fallido", 4, [[1, 1]]],
  [1, "Pagada", 6, [[6, 2], [7, 1]]],
  [2, "Pagada", 9, [[2, 1]]],
  [0, "Pagada", 12, [[3, 1], [9, 1]]],
];

const pool = getPool();
const cliente = await pool.connect();
try {
  await cliente.query("BEGIN");
  if (reset) {
    await cliente.query("TRUNCATE mensajes_contacto, orden_items, ordenes, productos, categorias, usuarios RESTART IDENTITY CASCADE");
  } else {
    const { rows } = await cliente.query("SELECT (SELECT COUNT(*) FROM productos) + (SELECT COUNT(*) FROM usuarios) AS n");
    if (Number(rows[0].n) > 0) {
      console.log("La base ya tiene datos. Usa `npm run db:seed -- --reset` para reemplazarlos.");
      await cliente.query("ROLLBACK");
      process.exit(0);
    }
  }

  const idCategoria = {};
  for (const c of categorias) {
    const { rows } = await cliente.query("INSERT INTO categorias (nombre, descripcion, imagen) VALUES ($1,$2,$3) RETURNING id", [c.nombre, c.descripcion, c.imagen]);
    idCategoria[c.nombre] = rows[0].id;
  }

  const idProducto = [];
  for (const [nombre, descripcion, precio, oferta, imagen, destacado, stock, critico, cat, ficha] of productos) {
    const { rows } = await cliente.query(
      `INSERT INTO productos (nombre, descripcion, precio, precio_oferta, imagen, destacado, stock, stock_critico, categoria_id, ficha)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb) RETURNING id`,
      [nombre, descripcion, precio, oferta, imagen, destacado, stock, critico, idCategoria[cat], JSON.stringify(ficha.map(([etiqueta, valor]) => ({ etiqueta, valor })))]
    );
    idProducto.push({ id: rows[0].id, nombre, imagen, precio: oferta ?? precio });
  }

  const idUsuario = [];
  for (const [nombre, apellidos, usuario, pass, nac, rol, estado] of usuarios) {
    const { rows } = await cliente.query(
      "INSERT INTO usuarios (nombre, apellidos, usuario, password_hash, fecha_nacimiento, rol, estado) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      [nombre, apellidos, usuario, await bcrypt.hash(pass, 10), nac, rol, estado]
    );
    idUsuario.push({ id: rows[0].id, nombre, apellidos, usuario });
  }

  let n = 0;
  for (const [u, estado, dias, lineas] of ordenes) {
    const dueno = idUsuario[u];
    const total = lineas.reduce((acc, [p, q]) => acc + idProducto[p].precio * q, 0);
    const { rows } = await cliente.query(
      `INSERT INTO ordenes (codigo, usuario_id, nombre, apellidos, correo, calle, region, comuna, total, estado, creado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now() - make_interval(days => $11::int)) RETURNING id`,
      [`DR-SEED-${String(++n).padStart(5, "0")}`, dueno.id, dueno.nombre, dueno.apellidos, `${dueno.usuario}@ejemplo.cl`,
       "Av. Siempre Viva 742", "Región Metropolitana de Santiago", "Santiago", total, estado, dias]
    );
    for (const [p, q] of lineas) {
      const prod = idProducto[p];
      await cliente.query(
        "INSERT INTO orden_items (orden_id, producto_id, nombre, imagen, precio_unitario, cantidad) VALUES ($1,$2,$3,$4,$5,$6)",
        [rows[0].id, prod.id, prod.nombre, prod.imagen, prod.precio, q]
      );
    }
  }

  await cliente.query("COMMIT");
  console.log("✔ Datos de ejemplo cargados.");
  console.log("  Administrador: admin / 1234");
  console.log("  Cliente:       owen / 1234   (Owen Grady)");
} catch (error) {
  await cliente.query("ROLLBACK").catch(() => {});
  console.error("✖ No se pudo cargar el seed:", error.message);
  process.exitCode = 1;
} finally {
  cliente.release();
  await pool.end();
}
