import type { ParametrosCotizacion } from "./tipos";

// Regimen General, ejercicio 2026.
// Orden PJC/297/2026, de 30 de marzo (BOE num. 79, de 31/03/2026), con efectos
// desde el 1 de enero de 2026.
// https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296
const ORDEN = "BOE-A-2026-7296 (Orden PJC/297/2026)";
const VERIFICADO = "2026-11-15";

export const parametros2026: ParametrosCotizacion = {
  ejercicio: 2026,

  topeMaximoMensual: { valor: 5101.2, fuente: `${ORDEN}, art. 2.1`, verificado: VERIFICADO },
  topeMinimoMensual: { valor: 1424.4, fuente: `${ORDEN}, art. 2.2`, verificado: VERIFICADO },

  basesMensuales: {
    valor: {
      1: { minima: 1989.3, maxima: 5101.2 },
      2: { minima: 1649.7, maxima: 5101.2 },
      3: { minima: 1435.2, maxima: 5101.2 },
      4: { minima: 1424.4, maxima: 5101.2 },
      5: { minima: 1424.4, maxima: 5101.2 },
      6: { minima: 1424.4, maxima: 5101.2 },
      7: { minima: 1424.4, maxima: 5101.2 },
    },
    fuente: `${ORDEN}, art. 3`,
    verificado: VERIFICADO,
  },

  basesDiarias: {
    valor: { minima: 47.48, maxima: 170.04 },
    fuente: `${ORDEN}, art. 3 (grupos 8 a 11)`,
    verificado: VERIFICADO,
  },

  baseMinimaHora: {
    valor: { 1: 11.98, 2: 9.94, 3: 8.65, 4: 8.58, 5: 8.58, 6: 8.58, 7: 8.58, 8: 8.58, 9: 8.58, 10: 8.58, 11: 8.58 },
    fuente: `${ORDEN}, art. 39.1`,
    verificado: VERIFICADO,
  },

  contingenciasComunes: {
    valor: { empresa: 23.6, trabajador: 4.7 },
    fuente: `${ORDEN}, art. 4`,
    verificado: VERIFICADO,
  },
  horasExtraFuerzaMayor: {
    valor: { empresa: 12, trabajador: 2 },
    fuente: `${ORDEN}, art. 5`,
    verificado: VERIFICADO,
  },
  horasExtraResto: {
    valor: { empresa: 23.6, trabajador: 4.7 },
    fuente: `${ORDEN}, art. 5`,
    verificado: VERIFICADO,
  },
  desempleoIndefinido: {
    valor: { empresa: 5.5, trabajador: 1.55 },
    fuente: `${ORDEN}, art. 33.2.a).1.º`,
    verificado: VERIFICADO,
  },
  desempleoDuracionDeterminada: {
    valor: { empresa: 6.7, trabajador: 1.6 },
    fuente: `${ORDEN}, art. 33.2.a).2.º`,
    verificado: VERIFICADO,
  },
  fogasa: {
    valor: { empresa: 0.2, trabajador: 0 },
    fuente: `${ORDEN}, art. 33.2.b)`,
    verificado: VERIFICADO,
  },
  formacionProfesional: {
    valor: { empresa: 0.6, trabajador: 0.1 },
    fuente: `${ORDEN}, art. 33.2.c)`,
    verificado: VERIFICADO,
  },
  mei: {
    valor: { empresa: 0.75, trabajador: 0.15 },
    fuente: `${ORDEN}, art. 16`,
    verificado: VERIFICADO,
  },

  // Vigente desde el 17/07/2023. No se ha localizado revision posterior, pero
  // la busqueda no fue exhaustiva: revisar en la actualizacion anual.
  locomocionExentaKm: {
    valor: 0.26,
    fuente: "BOE-A-2023-16461 (Orden HFP/792/2023), articulo unico",
    verificado: VERIFICADO,
  },
};
