import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID } from "../config";

const SCRIPT_GOOGLE = "https://accounts.google.com/gsi/client";
let promesaScript = null;

// Carga el script de Google Identity Services una sola vez.
function cargarScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!promesaScript) {
    promesaScript = new Promise((resolver, rechazar) => {
      const script = document.createElement("script");
      script.src = SCRIPT_GOOGLE;
      script.async = true;
      script.onload = resolver;
      script.onerror = () => {
        promesaScript = null;
        rechazar(new Error("No se pudo cargar el script de Google."));
      };
      document.head.appendChild(script);
    });
  }
  return promesaScript;
}

// Botón oficial "Continuar con Google". Al elegir una cuenta llama a onCredencial(idToken).
export default function BotonGoogle({ onCredencial }) {
  const contenedor = useRef(null);
  const alCredencial = useRef(onCredencial);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    alCredencial.current = onCredencial;
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let activo = true;
    cargarScript()
      .then(() => {
        if (!activo || !contenedor.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (respuesta) => alCredencial.current?.(respuesta.credential),
        });
        window.google.accounts.id.renderButton(contenedor.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          locale: "es",
        });
      })
      .catch(() => activo && setFallo(true));
    return () => {
      activo = false;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <div>
      <div ref={contenedor} className="d-flex justify-content-center" />
      {fallo && <p className="text-muted small text-center mb-0">No se pudo cargar el inicio de sesión con Google.</p>}
    </div>
  );
}
