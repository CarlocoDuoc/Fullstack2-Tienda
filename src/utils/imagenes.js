const SVG_PLACEHOLDER =
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
  '<rect width="400" height="300" fill="#e9ecef"/>' +
  '<text x="200" y="158" font-family="sans-serif" font-size="20" fill="#6c757d" text-anchor="middle">Sin imagen</text>' +
  "</svg>";

export const IMG_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(SVG_PLACEHOLDER);

// Las imágenes del catálogo se guardan como "img/archivo.jpeg" (carpeta public).
// Las subidas desde el admin se guardan como data URL y se usan tal cual.
export function rutaImagen(ruta) {
  if (!ruta) return IMG_PLACEHOLDER;
  if (/^(data:|https?:)/.test(ruta)) return ruta;
  return `${import.meta.env.BASE_URL}${ruta.replace(/^\//, "")}`;
}
