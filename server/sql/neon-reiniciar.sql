-- Esquema de Dino Rancho para PostgreSQL (Neon).
-- Es idempotente: se puede ejecutar varias veces (npm run db:migrate).

CREATE TABLE IF NOT EXISTS usuarios (
  id               SERIAL PRIMARY KEY,
  nombre           VARCHAR(50)  NOT NULL,
  apellidos        VARCHAR(50)  NOT NULL DEFAULT '',
  usuario          VARCHAR(30)  NOT NULL,
  password_hash    TEXT         NOT NULL,
  fecha_nacimiento DATE         NOT NULL,
  rol              VARCHAR(20)  NOT NULL DEFAULT 'Cliente' CHECK (rol IN ('Cliente', 'Administrador')),
  estado           VARCHAR(20)  NOT NULL DEFAULT 'Activo'  CHECK (estado IN ('Activo', 'Inactivo')),
  calle            VARCHAR(120) NOT NULL DEFAULT '',
  departamento     VARCHAR(30)  NOT NULL DEFAULT '',
  region           VARCHAR(80)  NOT NULL DEFAULT '',
  comuna           VARCHAR(80)  NOT NULL DEFAULT '',
  creado_en        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- El nombre de usuario es único sin distinguir mayúsculas
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_usuario_uq ON usuarios (LOWER(usuario));

CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(60)  NOT NULL UNIQUE,
  descripcion VARCHAR(200) NOT NULL DEFAULT '',
  imagen      TEXT         NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS productos (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   VARCHAR(300) NOT NULL,
  precio        INTEGER      NOT NULL CHECK (precio > 0),
  precio_oferta INTEGER      CHECK (precio_oferta IS NULL OR precio_oferta > 0),
  imagen        TEXT         NOT NULL DEFAULT '',
  destacado     BOOLEAN      NOT NULL DEFAULT FALSE,
  stock         INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_critico INTEGER      NOT NULL DEFAULT 5 CHECK (stock_critico >= 0),
  categoria_id  INTEGER      REFERENCES categorias (id) ON DELETE SET NULL,
  ficha         JSONB        NOT NULL DEFAULT '[]'::jsonb,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT oferta_menor_que_precio CHECK (precio_oferta IS NULL OR precio_oferta < precio)
);
CREATE INDEX IF NOT EXISTS productos_categoria_idx ON productos (categoria_id);

CREATE TABLE IF NOT EXISTS ordenes (
  id           SERIAL PRIMARY KEY,
  codigo       VARCHAR(30)  NOT NULL UNIQUE,
  usuario_id   INTEGER      REFERENCES usuarios (id) ON DELETE SET NULL,
  nombre       VARCHAR(50)  NOT NULL,
  apellidos    VARCHAR(50)  NOT NULL,
  correo       VARCHAR(100) NOT NULL,
  calle        VARCHAR(120) NOT NULL,
  departamento VARCHAR(30)  NOT NULL DEFAULT '',
  region       VARCHAR(80)  NOT NULL,
  comuna       VARCHAR(80)  NOT NULL,
  indicaciones VARCHAR(300) NOT NULL DEFAULT '',
  total        INTEGER      NOT NULL CHECK (total >= 0),
  estado       VARCHAR(20)  NOT NULL CHECK (estado IN ('Pagada', 'Pago fallido')),
  creado_en    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ordenes_usuario_idx ON ordenes (usuario_id);

-- Cada línea guarda una "foto" del nombre y el precio al momento de la compra,
-- para que la boleta no cambie si luego se edita o elimina el producto.
CREATE TABLE IF NOT EXISTS orden_items (
  id              SERIAL PRIMARY KEY,
  orden_id        INTEGER      NOT NULL REFERENCES ordenes (id) ON DELETE CASCADE,
  producto_id     INTEGER      REFERENCES productos (id) ON DELETE SET NULL,
  nombre          VARCHAR(100) NOT NULL,
  imagen          TEXT         NOT NULL DEFAULT '',
  precio_unitario INTEGER      NOT NULL CHECK (precio_unitario >= 0),
  cantidad        INTEGER      NOT NULL CHECK (cantidad > 0)
);
CREATE INDEX IF NOT EXISTS orden_items_orden_idx ON orden_items (orden_id);

CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR(50)   NOT NULL,
  correo    VARCHAR(100)  NOT NULL,
  asunto    VARCHAR(100)  NOT NULL,
  mensaje   VARCHAR(1000) NOT NULL,
  creado_en TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- REINICIO: borra TODOS los datos (usuarios, productos, órdenes, mensajes) y vuelve a cargar los de ejemplo.
TRUNCATE mensajes_contacto, orden_items, ordenes, productos, categorias, usuarios RESTART IDENTITY CASCADE;

-- Datos de ejemplo de Dino Rancho. Se cargan SOLO si la tabla de usuarios está vacía (se puede ejecutar varias veces).
-- Cuentas de prueba (el acceso es con nombre de usuario, sin correo):
--   Administrador:           admin / 1234
--   Cliente activo:          owen  / 1234   (Owen Grady)
--   Cliente inactivo:        alan  / 1234   (Alan Grant, no puede iniciar sesión)
DO $datos$
BEGIN
  IF EXISTS (SELECT 1 FROM usuarios) OR EXISTS (SELECT 1 FROM productos) THEN
    RAISE NOTICE 'La base ya tiene datos: no se cargó nada.';
    RETURN;
  END IF;

  INSERT INTO categorias (nombre, descripcion, imagen) VALUES
    ('Mascotas',   'Crías de dinosaurios y criaturas prehistóricas para tu hogar.', 'img/babytrike.jpeg'),
    ('Juguetes',   'Peluches y juguetes para los más pequeños del rancho.',         'img/Jugueteraptors.jpeg'),
    ('Accesorios', 'Todo lo necesario para cuidar a tu mascota prehistórica.',      'img/TrikePelota.jpeg');

  INSERT INTO productos (nombre, descripcion, precio, precio_oferta, imagen, destacado, stock, stock_critico, categoria_id, ficha) VALUES
    ('Baby Triceratops',     'Cría de triceratops, dócil y curiosa. Ideal para familias.',  89990, 79990, 'img/babytrike.jpeg',            true,  12, 3, (SELECT id FROM categorias WHERE nombre='Mascotas'),   '[{"etiqueta":"Edad","valor":"3 meses"},{"etiqueta":"Dieta","valor":"Herbívora"}]'),
    ('Baby Carnotaurus',     'Cría de carnotauro, juguetona y muy activa.',                 99990, NULL,  'img/BabyCarno.jpeg',            true,  8,  3, (SELECT id FROM categorias WHERE nombre='Mascotas'),   '[{"etiqueta":"Edad","valor":"4 meses"},{"etiqueta":"Dieta","valor":"Carnívora"}]'),
    ('Baby Onyx',            'Cría de color oscuro, tranquila y fácil de cuidar.',          94990, 84990, 'img/Babyonyx.jpeg',             false, 5,  5, (SELECT id FROM categorias WHERE nombre='Mascotas'),   '[{"etiqueta":"Edad","valor":"2 meses"}]'),
    ('Baby Spinosaurus',     'Cría de espinosaurio, ama el agua.',                          109990, NULL, 'img/babyspinos2.jpeg',          true,  4,  5, (SELECT id FROM categorias WHERE nombre='Mascotas'),   '[{"etiqueta":"Hábitat","valor":"Semiacuático"}]'),
    ('Baby Teryx Azul',      'Cría de pterosaurio de plumaje azul.',                        79990, NULL,  'img/babyteryxazul.jpeg',        false, 10, 3, (SELECT id FROM categorias WHERE nombre='Mascotas'),   '[]'),
    ('Microraptor',          'Pequeño dinosaurio con plumas, perfecto para espacios chicos.', 59990, 49990, 'img/microraptor.jpeg',       true,  15, 4, (SELECT id FROM categorias WHERE nombre='Mascotas'),   '[{"etiqueta":"Tamaño","valor":"Pequeño"}]'),
    ('Peluche Velociraptor', 'Peluche suave de velociraptor.',                              14990, NULL,  'img/juguerteVelociraptor.jpeg', false, 30, 5, (SELECT id FROM categorias WHERE nombre='Juguetes'),   '[]'),
    ('Peluche Carnotaurus',  'Peluche de carnotauro con textura suave.',                    15990, 12990, 'img/jugueteCarno.jpeg',         false, 25, 5, (SELECT id FROM categorias WHERE nombre='Juguetes'),   '[]'),
    ('Pack Raptors',         'Set de juguetes raptors para coleccionar.',                   19990, NULL,  'img/Jugueteraptors.jpeg',       false, 2,  5, (SELECT id FROM categorias WHERE nombre='Juguetes'),   '[]'),
    ('Pelota Triceratops',   'Pelota resistente para jugar con tu mascota.',                7990,  NULL,  'img/TrikePelota.jpeg',          false, 40, 8, (SELECT id FROM categorias WHERE nombre='Accesorios'), '[]'),
    ('Pelota Triceratops XL','Versión grande, apta para juego intenso.',                    11990, 9990,  'img/TrikePelota2.jpeg',         false, 0,  5, (SELECT id FROM categorias WHERE nombre='Accesorios'), '[]');

  INSERT INTO usuarios (nombre, apellidos, usuario, password_hash, fecha_nacimiento, rol, estado) VALUES
    ('Administrador', '',      'admin', '$2a$10$/RdMOZzJgAR6lMR5hUfjxO.e.IFmWvvREzsKFPjn5x6fnUn.uqS9G', '1995-01-01', 'Administrador', 'Activo'),
    ('Owen',          'Grady', 'owen',  '$2a$10$/RdMOZzJgAR6lMR5hUfjxO.e.IFmWvvREzsKFPjn5x6fnUn.uqS9G', '1984-06-15', 'Cliente',       'Activo'),
    ('Alan',          'Grant', 'alan',  '$2a$10$/RdMOZzJgAR6lMR5hUfjxO.e.IFmWvvREzsKFPjn5x6fnUn.uqS9G', '1960-02-03', 'Cliente',       'Inactivo');

  -- Órdenes de ejemplo (para ver historial, órdenes del admin y reportes)
  INSERT INTO ordenes (codigo, usuario_id, nombre, apellidos, correo, calle, region, comuna, total, estado, creado_en) VALUES
    ('DR-SEED-00001', (SELECT id FROM usuarios WHERE usuario='owen'), 'Owen', 'Grady', 'owen@ejemplo.cl', 'Av. Siempre Viva 742', 'Región Metropolitana de Santiago', 'Santiago', 95970, 'Pagada', now() - interval '1 day'),
    ('DR-SEED-00002', (SELECT id FROM usuarios WHERE usuario='owen'), 'Owen', 'Grady', 'owen@ejemplo.cl', 'Av. Siempre Viva 742', 'Región Metropolitana de Santiago', 'Santiago', 49990, 'Pagada', now() - interval '3 days'),
    ('DR-SEED-00003', (SELECT id FROM usuarios WHERE usuario='owen'), 'Owen', 'Grady', 'owen@ejemplo.cl', 'Av. Siempre Viva 742', 'Región Metropolitana de Santiago', 'Santiago', 99990, 'Pago fallido', now() - interval '4 days'),
    ('DR-SEED-00004', (SELECT id FROM usuarios WHERE usuario='owen'), 'Owen', 'Grady', 'owen@ejemplo.cl', 'Av. Siempre Viva 742', 'Región Metropolitana de Santiago', 'Santiago', 42970, 'Pagada', now() - interval '6 days'),
    ('DR-SEED-00005', (SELECT id FROM usuarios WHERE usuario='alan'), 'Alan', 'Grant', 'alan@ejemplo.cl', 'Av. Siempre Viva 742', 'Región Metropolitana de Santiago', 'Santiago', 84990, 'Pagada', now() - interval '9 days'),
    ('DR-SEED-00006', (SELECT id FROM usuarios WHERE usuario='admin'), 'Administrador', '', 'admin@ejemplo.cl', 'Av. Siempre Viva 742', 'Región Metropolitana de Santiago', 'Santiago', 117980, 'Pagada', now() - interval '12 days');

  -- Líneas de cada orden: guardan nombre e imagen y precio de ese momento
  INSERT INTO orden_items (orden_id, producto_id, nombre, imagen, precio_unitario, cantidad)
  SELECT o.id, p.id, p.nombre, p.imagen, COALESCE(p.precio_oferta, p.precio), l.cantidad
    FROM (VALUES
      ('DR-SEED-00001', 'Baby Triceratops', 1), ('DR-SEED-00001', 'Pelota Triceratops', 2),
      ('DR-SEED-00002', 'Microraptor', 1),
      ('DR-SEED-00003', 'Baby Carnotaurus', 1),
      ('DR-SEED-00004', 'Peluche Velociraptor', 2), ('DR-SEED-00004', 'Peluche Carnotaurus', 1),
      ('DR-SEED-00005', 'Baby Onyx', 1),
      ('DR-SEED-00006', 'Baby Spinosaurus', 1), ('DR-SEED-00006', 'Pelota Triceratops', 1)
    ) AS l(codigo, producto, cantidad)
    JOIN ordenes o ON o.codigo = l.codigo
    JOIN productos p ON p.nombre = l.producto;

  RAISE NOTICE 'Datos de ejemplo cargados.';
END
$datos$;
