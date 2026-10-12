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
