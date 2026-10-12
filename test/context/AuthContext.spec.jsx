import { fireEvent, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/context/AuthContext";
import { esperarQue } from "../ayudas";
import { api, borrarToken, guardarToken, obtenerToken } from "../../src/services/api";

function Sonda() {
  const { usuario, cargando, esAdmin, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="cargando">{String(cargando)}</span>
      <span data-testid="nombre">{usuario?.nombre ?? "nadie"}</span>
      <span data-testid="admin">{String(esAdmin)}</span>
      <button onClick={() => login("juan", "clave1234")}>entrar</button>
      <button onClick={() => login("juan", "mala").then((r) => (document.title = r.error ?? ""))}>entrar-mal</button>
      <button onClick={logout}>salir</button>
    </div>
  );
}

const montar = () =>
  render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>
  );

describe("AuthContext", () => {
  beforeEach(() => borrarToken());
  afterEach(() => borrarToken());

  it("sin token empieza sin sesión y sin cargar", () => {
    montar();
    expect(screen.getByTestId("cargando").textContent).toBe("false");
    expect(screen.getByTestId("nombre").textContent).toBe("nadie");
  });

  it("con token guardado recupera al usuario desde la API", async () => {
    guardarToken("tok");
    spyOn(api.auth, "me").and.resolveTo({ usuario: { id: 1, nombre: "Carl", rol: "Administrador" } });
    montar();
    expect(screen.getByTestId("cargando").textContent).toBe("true");
    await esperarQue(() => screen.getByTestId("nombre").textContent === "Carl");
    expect(screen.getByTestId("admin").textContent).toBe("true");
    expect(screen.getByTestId("cargando").textContent).toBe("false");
  });

  it("login correcto guarda el token y el usuario", async () => {
    spyOn(api.auth, "login").and.resolveTo({ token: "nuevo", usuario: { id: 2, nombre: "Juan", rol: "Cliente" } });
    montar();
    fireEvent.click(screen.getByText("entrar"));
    await esperarQue(() => screen.getByTestId("nombre").textContent === "Juan");
    expect(obtenerToken()).toBe("nuevo");
    expect(screen.getByTestId("admin").textContent).toBe("false");
  });

  it("login fallido devuelve el mensaje y no deja sesión", async () => {
    spyOn(api.auth, "login").and.rejectWith(new Error("Usuario o contraseña incorrectos."));
    montar();
    fireEvent.click(screen.getByText("entrar-mal"));
    await esperarQue(() => document.title.includes("incorrectos"));
    expect(screen.getByTestId("nombre").textContent).toBe("nadie");
    expect(obtenerToken()).toBeNull();
  });

  it("logout borra el token y la sesión", async () => {
    spyOn(api.auth, "login").and.resolveTo({ token: "nuevo", usuario: { id: 2, nombre: "Juan", rol: "Cliente" } });
    montar();
    fireEvent.click(screen.getByText("entrar"));
    await esperarQue(() => screen.getByTestId("nombre").textContent === "Juan");
    fireEvent.click(screen.getByText("salir"));
    expect(screen.getByTestId("nombre").textContent).toBe("nadie");
    expect(obtenerToken()).toBeNull();
  });

  it("al expirar la sesión (evento) se cierra automáticamente", async () => {
    spyOn(api.auth, "login").and.resolveTo({ token: "t", usuario: { id: 2, nombre: "Juan", rol: "Cliente" } });
    montar();
    fireEvent.click(screen.getByText("entrar"));
    await esperarQue(() => screen.getByTestId("nombre").textContent === "Juan");
    window.dispatchEvent(new Event("dino:sesion-expirada"));
    await esperarQue(() => screen.getByTestId("nombre").textContent === "nadie");
  });
});
