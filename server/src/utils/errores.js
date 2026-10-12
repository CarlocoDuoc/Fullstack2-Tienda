// Error controlado: se convierte en una respuesta JSON con el código HTTP indicado.
export class ApiError extends Error {
  constructor(estado, mensaje, campos = null) {
    super(mensaje);
    this.estado = estado;
    this.campos = campos;
  }
}

// Permite usar async/await en las rutas sin try/catch repetidos.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function noEncontrada(req, res, next) {
  next(new ApiError(404, "Ruta no encontrada."));
}

// eslint-disable-next-line no-unused-vars
export function manejarErrores(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.estado).json({ error: error.message, ...(error.campos && { campos: error.campos }) });
  }
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "El contenido enviado es demasiado grande." });
  }
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." });
  }
  // Violaciones de unicidad / llaves foráneas de PostgreSQL
  if (error?.code === "23505") return res.status(409).json({ error: "Ya existe un registro con esos datos." });
  if (error?.code === "23503") return res.status(409).json({ error: "El registro está relacionado con otros datos." });
  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor." });
}
