#!/usr/bin/env node
// Hook del plugin obradoiro-xestion.
// Claude Code lo ejecuta despues de cada edicion de archivo. Si el archivo
// editado esta en src/motor o src/parametros, pasa las pruebas (npm test).
// Si fallan, devuelve el resultado a Claude para que lo comunique al docente.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const CARPETAS_VIGILADAS = ["src/motor/", "src/parametros/"];

let aviso;
try {
  aviso = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0); // Sin datos de la edicion no hay nada que comprobar.
}

const archivo = aviso?.tool_input?.file_path;
const proyecto = process.env.CLAUDE_PROJECT_DIR || aviso?.cwd || process.cwd();
if (!archivo) process.exit(0);

const relativo = path.relative(proyecto, path.resolve(proyecto, archivo)).replaceAll("\\", "/");
const vigilado = CARPETAS_VIGILADAS.some((carpeta) => relativo.startsWith(carpeta));
if (!vigilado) process.exit(0);

// Solo actua en un proyecto con pruebas (el Obradoiro); en otro, no molesta.
if (!existsSync(path.join(proyecto, "package.json"))) process.exit(0);

const pruebas = spawnSync("npm test", {
  cwd: proyecto,
  shell: true,
  encoding: "utf8",
  env: { ...process.env, NO_COLOR: "1", CI: "1" },
});

const texto = `${pruebas.stdout ?? ""}${pruebas.stderr ?? ""}`.trim();

if (pruebas.status === 0) {
  const resumen = texto.split("\n").filter((linea) => /^\s*Tests\s/.test(linea)).join(" ").replace(/\s+/g, " ").trim();
  console.log(JSON.stringify({ systemMessage: `Pruebas tras editar ${relativo}: correctas. ${resumen}` }));
  process.exit(0);
}

// Codigo 2: Claude recibe este texto y debe tratarlo antes de seguir.
const ultimasLineas = texto.split("\n").slice(-60).join("\n");
console.error(
  `Las pruebas FALLAN tras editar ${relativo}.\n` +
    "Comunica al docente el resultado real. No modifiques las pruebas para que pasen.\n\n" +
    ultimasLineas,
);
process.exit(2);
