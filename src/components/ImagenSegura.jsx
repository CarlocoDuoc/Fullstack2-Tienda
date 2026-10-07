import { IMG_PLACEHOLDER, rutaImagen } from "../utils/imagenes";

// <img> que usa una imagen de reemplazo si el archivo no se puede cargar.
export default function ImagenSegura({ src, alt, ...resto }) {
  const alFallar = (evento) => {
    if (evento.currentTarget.dataset.fallback) return;
    evento.currentTarget.dataset.fallback = "1";
    evento.currentTarget.src = IMG_PLACEHOLDER;
  };
  return <img src={rutaImagen(src)} alt={alt} onError={alFallar} {...resto} />;
}
