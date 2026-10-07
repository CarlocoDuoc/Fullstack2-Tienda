// Datos iniciales ("semillas") de la base de datos simulada.
// Se cargan en localStorage la primera vez que se abre el sitio.

export const productosSemilla = [
  {
    id: 1,
    nombre: "Triceratops Adulto",
    precio: 590000,
    descripcion: "Un animal de tamaño grande, lleno de energía siempre.",
    imagen: "img/JWETriceratops.webp",
    destacado: false,
  },
  {
    id: 2,
    nombre: "Baryonyx (2 meses)",
    precio: 210000,
    descripcion: "Un dinosaurio semiacuático de tamaño mediano.",
    imagen: "img/Babyonyx.jpeg",
    destacado: true,
    ficha: [
      { etiqueta: "Dieta", valor: "Piscívora" },
      { etiqueta: "Tamaño máximo", valor: "3 m de alto, 6 m de largo" },
      { etiqueta: "Sociabilidad", valor: "Sociable, se puede tener solo o en grupos pequeños" },
      {
        etiqueta: "Cuidados especiales",
        valor:
          "Al ser semiacuático necesita un lugar con agua donde pueda descansar y nadar, algo similar a los patos.",
      },
    ],
  },
  {
    id: 3,
    nombre: "Pelota para dinosaurios",
    precio: 9500,
    descripcion: "Una pelota súper resistente.",
    imagen: "img/TrikePelota2.jpeg",
    destacado: true,
  },
  {
    id: 4,
    nombre: "Hatzegopteryx (3 semanas)",
    precio: 250000,
    descripcion: "Un reptil volador de gran tamaño.",
    imagen: "img/Gemini_Generated_Image_dxhn9hdxhn9hdxhn.jpeg",
    destacado: false,
  },
  {
    id: 5,
    nombre: "Hatzegopteryx Blue (3 semanas)",
    precio: 390000,
    descripcion: "Un reptil volador de gran tamaño y colorido.",
    imagen: "img/babyteryxazul.jpeg",
    destacado: false,
  },
  {
    id: 6,
    nombre: "Triceratops Leopard (2 - 3 meses)",
    precio: 300000,
    descripcion: "Un animal de tamaño grande.",
    imagen: "img/babytrike.jpeg",
    destacado: false,
  },
  {
    id: 7,
    nombre: "Hatzegopteryx (Adulto)",
    precio: 800000,
    descripcion: "Un animal de tamaño grande.",
    imagen: "img/hatzeAdulto.jpeg",
    destacado: true,
  },
  {
    id: 8,
    nombre: "Argentavis (Adulto)",
    precio: 700000,
    descripcion: "Un animal de tamaño grande.",
    imagen: "img/Argentavis.jpeg",
    destacado: false,
  },
  // Estos tres aparecían en el Home original pero no existían en el catálogo.
  {
    id: 9,
    nombre: "Juguete para raptores",
    precio: 30000,
    descripcion: "Un juguete resistente para raptores con ganas de jugar.",
    imagen: "img/Jugueteraptors.jpeg",
    destacado: true,
  },
  {
    id: 10,
    nombre: "Juguete de cuerda",
    precio: 10000,
    descripcion: "Un juguete de cuerda para entretener a tu dinosaurio.",
    imagen: "img/Juguetecarno2.jpeg",
    destacado: true,
  },
  {
    id: 11,
    nombre: "Carnotaurus bebé (3 semanas)",
    precio: 250000,
    descripcion: "Un carnívoro pequeño que necesita cuidados desde el primer día.",
    imagen: "img/BabyCarno.jpeg",
    destacado: true,
  },
];

export const usuariosSemilla = [
  {
    id: 1,
    nombre: "Juan Pérez",
    correo: "juan.perez@duocuc.cl",
    password: "password123",
    fechaNacimiento: "1995-06-15",
    rol: "Cliente",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Carlos Rivas",
    correo: "carl.rivas@duocuc.cl",
    password: "admin123",
    fechaNacimiento: "1988-03-20",
    rol: "Administrador",
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Carlos Rojas",
    correo: "carlos.rojas@duocuc.cl",
    password: "clave1234",
    fechaNacimiento: "2001-11-10",
    rol: "Cliente",
    estado: "Inactivo",
  },
];
