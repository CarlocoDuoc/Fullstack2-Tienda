// "Base de datos" simulada del proyecto.
//
// Cada colección guarda su información en localStorage (persistencia) y
// expone las operaciones CRUD: crear, listar, obtener, actualizar y eliminar.
// Además permite que los componentes React se suscriban a los cambios, de modo
// que la interfaz se actualiza sola cuando los datos cambian (ver
// hooks/useColeccion.js).

import { productosSemilla, usuariosSemilla } from "./semillas";

export function crearColeccion(clave, semilla) {
  let cache = null;
  const oyentes = new Set();

  const persistir = () => {
    try {
      window.localStorage.setItem(clave, JSON.stringify(cache));
    } catch (error) {
      console.error(`No se pudo guardar "${clave}" en localStorage`, error);
    }
  };

  const cargar = () => {
    if (cache) return cache;
    try {
      const crudo = window.localStorage.getItem(clave);
      cache = crudo ? JSON.parse(crudo) : null;
    } catch {
      cache = null;
    }
    if (!Array.isArray(cache)) {
      cache = structuredClone(semilla);
      persistir();
    }
    return cache;
  };

  // Cada cambio reemplaza el arreglo completo (nunca se muta el anterior):
  // así React detecta que hay datos nuevos.
  const guardar = (nuevaLista) => {
    cache = nuevaLista;
    persistir();
    oyentes.forEach((avisar) => avisar());
  };

  const mismoId = (a, b) => Number(a) === Number(b);

  return {
    // READ
    listar: () => cargar(),
    obtener: (id) => cargar().find((item) => mismoId(item.id, id)) ?? null,

    // CREATE: asigna el siguiente id disponible
    crear: (datos) => {
      const lista = cargar();
      const id = lista.length ? Math.max(...lista.map((item) => Number(item.id))) + 1 : 1;
      const nuevo = { ...datos, id };
      guardar([...lista, nuevo]);
      return nuevo;
    },

    // UPDATE: devuelve el registro actualizado o null si no existe
    actualizar: (id, cambios) => {
      let actualizado = null;
      const nuevaLista = cargar().map((item) => {
        if (!mismoId(item.id, id)) return item;
        actualizado = { ...item, ...cambios, id: item.id };
        return actualizado;
      });
      if (!actualizado) return null;
      guardar(nuevaLista);
      return actualizado;
    },

    // DELETE: devuelve true si eliminó algo
    eliminar: (id) => {
      const lista = cargar();
      const nuevaLista = lista.filter((item) => !mismoId(item.id, id));
      if (nuevaLista.length === lista.length) return false;
      guardar(nuevaLista);
      return true;
    },

    // Vuelve a los datos iniciales (útil en pruebas y en la demo)
    reiniciar: () => guardar(structuredClone(semilla)),

    // API para useSyncExternalStore
    suscribir: (avisar) => {
      oyentes.add(avisar);
      // Si otra pestaña modifica los datos, recargamos desde localStorage.
      const alCambiarStorage = (evento) => {
        if (evento.key === clave) {
          cache = null;
          avisar();
        }
      };
      window.addEventListener("storage", alCambiarStorage);
      return () => {
        oyentes.delete(avisar);
        window.removeEventListener("storage", alCambiarStorage);
      };
    },
    obtenerSnapshot: () => cargar(),
  };
}

export const productosDB = crearColeccion("dino_productos", productosSemilla);
export const usuariosDB = crearColeccion("dino_usuarios", usuariosSemilla);
