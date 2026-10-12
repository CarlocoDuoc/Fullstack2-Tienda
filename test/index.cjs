// Punto de entrada de Karma: carga todos los archivos *.spec.js / *.spec.jsx de esta carpeta.
const contexto = require.context("./", true, /\.spec\.jsx?$/);
contexto.keys().forEach(contexto);
