# API de Dino Rancho (Express + PostgreSQL en Neon)

El frontend (React) no puede hablar directo con Neon sin exponer las credenciales, por eso esta API
es la única que usa `DATABASE_URL`. Guarda **usuarios, productos, categorías, órdenes y mensajes** en Neon.

## Puesta en marcha
1. En [neon.tech](https://neon.tech) crea un proyecto y copia la *connection string* (termina en `?sslmode=require`).
2. `cp .env.example .env` y completa `DATABASE_URL`, `JWT_SECRET` (cadena larga aleatoria) y `CORS_ORIGIN`.
3. `npm install`
4. `npm run db:setup` (crea las tablas y carga datos de ejemplo; `npm run db:seed -- --reset` los reemplaza).
5. `npm run dev` → API en `http://localhost:3001` (`/api/salud` comprueba la conexión).

Cuentas de ejemplo: `admin / 1234` (administrador), `owen / 1234` (Owen Grady, cliente) y `alan / 1234` (Alan Grant, cliente inactivo). `npm run db:reset` borra y recarga los datos de ejemplo; también puedes pegar `sql/neon-reiniciar.sql` en el SQL Editor de Neon.

## Endpoints
| Ruta | Acceso |
|---|---|
| `POST /api/auth/registro`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/perfil` | público / sesión |
| `GET /api/productos`, `GET /api/productos/:id`, `GET /api/categorias(/:id)` | público |
| `POST/PUT/DELETE /api/productos`, `/api/categorias`, `GET /api/productos/criticos` | admin |
| `POST /api/ordenes` (compra, pago simulado) | sesión iniciada |
| `GET /api/ordenes/mias`, `GET /api/ordenes/:id` | sesión (dueño o admin) |
| `GET /api/ordenes`, `/api/usuarios/*`, `/api/admin/*` | admin |
| `POST /api/contacto` | público |

## Compra
Dentro de una transacción se bloquean los productos (`FOR UPDATE`), se toman precio y stock **desde la base**
(nunca del cliente), se crea la orden y sus líneas y, si el pago simulado fue aprobado, se descuenta el stock.
Un pago rechazado queda registrado como «Pago fallido» sin tocar el stock.

## Pruebas
`npm test` (pruebas de la lógica pura con `node:test`, no requieren base de datos).
