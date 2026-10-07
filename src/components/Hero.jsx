import ImagenSegura from "./ImagenSegura";

// Banner con texto a la izquierda e imagen a la derecha.
export default function Hero({ titulo, subtitulo, imagen, alt, children }) {
  return (
    <section className="wrapper">
      <div className="texto">
        <h1>{titulo}</h1>
        {subtitulo && <h2>{subtitulo}</h2>}
        {children}
      </div>
      <div className="imagen">
        <ImagenSegura src={imagen} alt={alt} />
      </div>
    </section>
  );
}
