// Karma + Jasmine con webpack/babel (soporta JSX). Ejecutar: npm test  |  cobertura: npm run test:cov
// Requiere Google Chrome o Chromium instalado (si no está en el PATH, define CHROME_BIN).
const webpack = require("webpack");

module.exports = function (config) {
  const cobertura = process.argv.includes("--coverage");

  config.set({
    basePath: "",
    frameworks: ["jasmine", "webpack"],
    plugins: ["karma-jasmine", "karma-webpack", "karma-chrome-launcher", "karma-sourcemap-loader", "karma-coverage"],
    files: [{ pattern: "test/index.cjs", watched: false }],
    preprocessors: { "test/index.cjs": ["webpack", "sourcemap"] },

    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            // package.json tiene "type": "module": sin esto webpack exige extensión en cada import
            test: /\.m?jsx?$/,
            resolve: { fullySpecified: false },
          },
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                // babel-plugin-istanbul instrumenta solo el código de src/ (no los tests)
                plugins: cobertura ? [["istanbul", { include: ["src/**"], exclude: ["test/**"] }]] : [],
              },
            },
          },
          { test: /\.css$/, use: "null-loader" },
        ],
      },
      resolve: { extensions: [".js", ".jsx"] },
      // Vite define import.meta.env; aquí se reemplaza por un objeto vacío
      plugins: [new webpack.DefinePlugin({ "import.meta.env": "({})" })],
    },
    webpackMiddleware: { stats: "errors-only" },

    browsers: ["ChromeHeadlessCI"],
    customLaunchers: {
      ChromeHeadlessCI: { base: "ChromeHeadless", flags: ["--no-sandbox", "--disable-gpu"] },
    },

    reporters: cobertura ? ["progress", "coverage"] : ["progress"],
    coverageReporter: {
      dir: "coverage",
      reporters: [{ type: "text-summary" }, { type: "html", subdir: "html" }, { type: "lcov", subdir: "lcov" }],
    },

    client: { jasmine: { random: true } },
    // `npm test` y `npm run test:cov` pasan --single-run (corren una vez y terminan).
    // `npm run test:watch` NO lo pasa: queda vivo y vuelve a correr las pruebas cada vez que guardas un archivo.
    autoWatch: true,
  });
};
