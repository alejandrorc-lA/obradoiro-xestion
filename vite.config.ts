import { defineConfig } from "vitest/config";

export default defineConfig({
  // Rutas relativas: la web funciona igual en GitHub Pages que en local.
  base: "./",
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
