import { Router } from "express";
import { consultar } from "../db.js";
import { ApiError, asyncHandler } from "../utils/errores.js";
import { soloErrores, texto, validarCorreoGeneral, validarNombre } from "../utils/validaciones.js";

const router = Router();

// POST /api/contacto (público)
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { nombre, correo, asunto, mensaje } = req.body ?? {};
    const errores = soloErrores({
      nombre: validarNombre(nombre),
      correo: validarCorreoGeneral(correo),
      asunto: !texto(asunto) ? "El asunto es obligatorio." : texto(asunto).length > 100 ? "El asunto no puede superar los 100 caracteres." : "",
      mensaje: !texto(mensaje) ? "El mensaje es obligatorio." : texto(mensaje).length > 1000 ? "El mensaje no puede superar los 1000 caracteres." : "",
    });
    if (errores) throw new ApiError(400, "Revisa los campos del formulario.", errores);
    await consultar("INSERT INTO mensajes_contacto (nombre, correo, asunto, mensaje) VALUES ($1, $2, $3, $4)", [
      texto(nombre),
      texto(correo),
      texto(asunto),
      texto(mensaje),
    ]);
    res.status(201).json({ ok: true });
  })
);

export default router;
