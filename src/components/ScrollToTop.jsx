import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Al cambiar de página, vuelve al inicio (el router de React no lo hace solo).
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
