import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../src/components/ProtectedRoute";
import { AuthProvider } from "../../src/context/AuthContext";
import { api, borrarToken, guardarToken } from "../../src/services/api";

const montar = (roles) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/privada"]}>
        <Routes>
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route path="/" element={<p>Inicio</p>} />
          <Route
            path="/privada"
            element={
              <ProtectedRoute roles={roles}>
                <p>Contenido privado</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

describe("ProtectedRoute", () => {
  beforeEach(() => borrarToken());
  afterEach(() => borrarToken());

  it("sin sesión redirige al login", () => {
    montar();
    expect(screen.getByText("Pantalla de login")).toBeTruthy();
  });

  it("con sesión permite ver el contenido", async () => {
    guardarToken("t");
    spyOn(api.auth, "me").and.resolveTo({ usuario: { id: 1, nombre: "Juan", rol: "Cliente" } });
    montar();
    expect(await screen.findByText("Contenido privado")).toBeTruthy();
  });

  it("con un rol no permitido redirige al inicio", async () => {
    guardarToken("t");
    spyOn(api.auth, "me").and.resolveTo({ usuario: { id: 1, nombre: "Juan", rol: "Cliente" } });
    montar(["Administrador"]);
    expect(await screen.findByText("Inicio")).toBeTruthy();
  });

  it("mientras verifica la sesión no redirige", () => {
    guardarToken("t");
    spyOn(api.auth, "me").and.returnValue(new Promise(() => {})); // nunca responde
    montar();
    expect(screen.getByText(/Verificando sesión/)).toBeTruthy();
    expect(screen.queryByText("Pantalla de login")).toBeNull();
  });
});
