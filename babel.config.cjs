// Solo lo usa Karma (Vite compila el proyecto con su propio plugin de React).
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { chrome: "100" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
