// Ayudas para "Iniciar sesión con Google".

// Verifica el ID token que entrega Google (firma, caducidad y que sea para ESTA app).
// Se importa la librería al usarla para que los tests no la necesiten.
export async function verificarTokenGoogle(idToken, clientId) {
  const { OAuth2Client } = await import("google-auth-library");
  const cliente = new OAuth2Client(clientId);
  const ticket = await cliente.verifyIdToken({ idToken, audience: clientId });
  const p = ticket.getPayload();
  return {
    sub: p.sub,
    email: p.email ?? "",
    emailVerificado: p.email_verified === true,
    nombre: p.given_name || p.name || "",
    apellidos: p.family_name || "",
  };
}

// "Ana.Soto+tienda@gmail.com" -> "Ana.Sototienda"  (solo letras, números, punto, guion y guion bajo; máx. 24)
export function usuarioBaseDesdeCorreo(correo) {
  const local = String(correo).split("@")[0] ?? "";
  const limpio = local.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 24);
  return limpio.length >= 3 ? limpio : `${limpio}user`.slice(0, 24);
}

// intento 0 -> "ana"; intento 1 -> "ana1"; intento 2 -> "ana2"... (siempre entre 3 y 30 caracteres)
export const candidatoUsuario = (base, intento) => (intento === 0 ? base : `${base}${intento}`);
