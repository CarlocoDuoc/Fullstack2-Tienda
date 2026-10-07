// Funciones puras de formato (fáciles de probar con Jasmine).

export function formatearPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CL");
}

// "1995-06-15" -> "15/06/1995"
export function formatearFecha(fechaIso) {
  if (!fechaIso) return "N/A";
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}/${mes}/${anio}`;
}
