import { act, renderHook } from "@testing-library/react";
import { useFormulario } from "../../src/hooks/useFormulario";

const validar = (v) => ({ nombre: v.nombre.trim() ? "" : "Obligatorio", terminos: v.terminos ? "" : "Acepta" });
const iniciales = { nombre: "", terminos: false };
const evento = (name, value, type = "text", checked = false) => ({ target: { name, value, type, checked } });

describe("useFormulario", () => {
  it("empieza inválido y sin campos tocados", () => {
    const { result } = renderHook(() => useFormulario(iniciales, validar));
    expect(result.current.esValido).toBeFalse();
    expect(result.current.tocados).toEqual({});
  });

  it("cambiar actualiza el valor y marca el campo como tocado", () => {
    const { result } = renderHook(() => useFormulario(iniciales, validar));
    act(() => result.current.cambiar(evento("nombre", "Ana")));
    expect(result.current.valores.nombre).toBe("Ana");
    expect(result.current.tocados.nombre).toBeTrue();
    expect(result.current.errores.nombre).toBe("");
  });

  it("maneja checkboxes con checked", () => {
    const { result } = renderHook(() => useFormulario(iniciales, validar));
    act(() => result.current.cambiar(evento("terminos", "on", "checkbox", true)));
    expect(result.current.valores.terminos).toBeTrue();
  });

  it("es válido cuando todos los campos cumplen", () => {
    const { result } = renderHook(() => useFormulario(iniciales, validar));
    act(() => result.current.cambiar(evento("nombre", "Ana")));
    act(() => result.current.cambiar(evento("terminos", "on", "checkbox", true)));
    expect(result.current.esValido).toBeTrue();
  });

  it("tocarTodo marca todos los campos", () => {
    const { result } = renderHook(() => useFormulario(iniciales, validar));
    act(() => result.current.tocarTodo());
    expect(result.current.tocados).toEqual({ nombre: true, terminos: true });
  });

  it("muestra errores del servidor hasta que el campo cambie", () => {
    const { result } = renderHook(() => useFormulario(iniciales, validar));
    act(() => result.current.cambiar(evento("nombre", "Ana")));
    act(() => result.current.fijarErroresServidor({ nombre: "Ya existe" }));
    expect(result.current.errores.nombre).toBe("Ya existe");
    expect(result.current.esValido).toBeFalse();
    act(() => result.current.cambiar(evento("nombre", "Ana B")));
    expect(result.current.errores.nombre).toBe("");
  });

  it("establecer cambia varios valores sin tocar los demás", () => {
    const { result } = renderHook(() => useFormulario(iniciales, validar));
    act(() => result.current.establecer({ nombre: "Luz" }));
    expect(result.current.valores).toEqual({ nombre: "Luz", terminos: false });
  });
});
