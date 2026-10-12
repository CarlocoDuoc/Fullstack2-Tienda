// Divide una lista en grupos de `tamano` elementos (para el carrusel).
export function dividirEnGrupos(lista, tamano) {
  const grupos = [];
  for (let i = 0; i < lista.length; i += tamano) grupos.push(lista.slice(i, i + tamano));
  return grupos;
}
