import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../src/context/AuthContext";
import { api, borrarToken } from "../../src/services/api";
import LoginPage from "../../src/pages/store/LoginPage";

const montar = () =>
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  );

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta, { exact: false }), { target: { value: valor } });

describe("LoginPage", () => {
  beforeEach(() => borrarToken());
  afterEach(() => borrarToken());

  it("exige usuario y contraseña y no llama a la API si están vacíos", () => {
    const espia = spyOn(api.auth, "login");
    montar();
    fireEvent.click(screen.getByText("Ingresar"));
    expect(screen.getByText(/Ingresa tu usuario/)).toBeTruthy();
    expect(screen.getByText(/Ingresa tu contraseña/)).toBeTruthy();
    expect(espia).not.toHaveBeenCalled();
  });

  it("con credenciales válidas llama a la API y da la bienvenida", async () => {
    spyOn(api.auth, "login").and.resolveTo({ token: "t", usuario: { id: 1, nombre: "Juan", rol: "Cliente" } });
    montar();
    escribir("Usuario", "cliente");
    escribir("Contraseña", "clave1234");
    fireEvent.click(screen.getByText("Ingresar"));
    expect(await screen.findByText(/Bienvenido\/a, Juan/)).toBeTruthy();
  });

  it("si el servidor rechaza las credenciales muestra el error", async () => {
    spyOn(api.auth, "login").and.rejectWith(new Error("Usuario o contraseña incorrectos. Verifica tus datos."));
    montar();
    escribir("Usuario", "cliente");
    escribir("Contraseña", "mala1");
    fireEvent.click(screen.getByText("Ingresar"));
    expect((await screen.findByRole("alert")).textContent).toContain("incorrectos");
  });
});
