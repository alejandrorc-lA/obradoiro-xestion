#!/usr/bin/env node
// Ejecuta una funcion del motor con los datos de un supuesto y muestra el
// resultado en JSON. Asi la solucion de un supuesto sale siempre del motor.
//
// Uso, desde la raiz del proyecto:
//   node calcular.mjs <archivo-del-motor> <funcion> <ano> <datos.json>
// Ejemplo:
//   node calcular.mjs src/motor/nomina.ts calcularNomina 2026 supostos/datos.json

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [archivoMotor, funcion, ano, archivoDatos] = process.argv.slice(2);
if (!archivoMotor || !funcion || !ano || !archivoDatos) {
  console.error("Uso: node calcular.mjs <archivo-del-motor> <funcion> <ano> <datos.json>");
  process.exit(1);
}

const raiz = process.cwd();
const carpetaVite = path.join(raiz, "node_modules", "vite");
if (!existsSync(carpetaVite)) {
  console.error("No encuentro node_modules/vite. Ejecuta esto desde la raiz del proyecto, despues de 'npm install'.");
  process.exit(1);
}

// Vite sabe leer TypeScript: se usa solo para cargar el motor, sin abrir la web.
function entradaDeVite() {
  const paquete = JSON.parse(readFileSync(path.join(carpetaVite, "package.json"), "utf8"));
  const raizExports = paquete.exports?.["."] ?? paquete.exports;
  let entrada = raizExports;
  while (entrada && typeof entrada !== "string") {
    entrada = entrada.import ?? entrada.default;
  }
  return path.join(carpetaVite, entrada ?? paquete.module ?? paquete.main);
}

const { createServer } = await import(pathToFileURL(entradaDeVite()).href);
const servidor = await createServer({
  root: raiz,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true },
});

let salida = 0;
try {
  const motor = await servidor.ssrLoadModule("/" + archivoMotor.replaceAll("\\", "/"));
  if (typeof motor[funcion] !== "function") {
    throw new Error(`'${funcion}' no existe en ${archivoMotor}. Funciones disponibles: ${Object.keys(motor).join(", ")}`);
  }
  const moduloParametros = await servidor.ssrLoadModule(`/src/parametros/${ano}.ts`);
  const parametros = moduloParametros[`parametros${ano}`];
  if (!parametros) throw new Error(`src/parametros/${ano}.ts no exporta 'parametros${ano}'.`);

  const datos = JSON.parse(readFileSync(path.resolve(raiz, archivoDatos), "utf8"));
  const resultado = motor[funcion](datos, parametros);
  console.log(JSON.stringify({ motor: archivoMotor, funcion, parametros: Number(ano), datos, resultado }, null, 2));
} catch (error) {
  console.error(`Error del motor: ${error instanceof Error ? error.message : error}`);
  salida = 1;
} finally {
  await servidor.close();
}
process.exit(salida);
