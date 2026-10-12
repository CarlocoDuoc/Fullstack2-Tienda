// Funciones puras de formato (fáciles de probar con Jasmine).

export function formatearPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CL");
}

// "1995-06-15" -> "15/06/1995"
export function formatearFecha(fechaIso) {
  if (!fechaIso) return "N/A";
  const [anio, mes, dia] = String(fechaIso).slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}

// "2026-10-08T15:30:00Z" -> "08/10/2026 12:30" (hora local)
export function formatearFechaHora(iso) {
  if (!iso) return "N/A";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "N/A";
  const dos = (n) => String(n).padStart(2, "0");
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}
