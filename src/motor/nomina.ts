import type { GrupoCotizacion, ParametrosCotizacion, TipoRepartido } from "../parametros/tipos";
import { redondearCentimos } from "./redondeo";

// Motor de nomina del Regimen General, procedimiento ordinario, mes completo.
// Fuera de alcance por ahora: contrato de formacion en alternancia (cuotas
// unicas), incapacidad temporal, meses incompletos y cotizacion de solidaridad.
//
// Criterio de redondeo: cada concepto se redondea a centimos y despues se suma.

export interface Percepcion {
  concepto: string;
  importe: number;
}

export interface PercepcionNoSalarial extends Percepcion {
  /** Parte del importe exenta de cotizacion y de IRPF. */
  exento: number;
}

export interface DatosNomina {
  grupo: GrupoCotizacion;
  /** Dias del periodo de liquidacion (mes completo). */
  diasPeriodo: number;
  contrato: "indefinido" | "duracion_determinada";
  /** Solo en contratos a tiempo parcial: horas realmente trabajadas en el mes. */
  horasMesTiempoParcial?: number;
  /** Salario base y complementos salariales, sin horas extra ni pagas extra. */
  percepcionesSalariales: Percepcion[];
  horasExtraFuerzaMayor?: number;
  horasExtraResto?: number;
  pagasExtra: { numero: number; importe: number; prorrateadas: boolean };
  percepcionesNoSalariales?: PercepcionNoSalarial[];
  /** Tipo de AT y EP de la tarifa de primas, en %. Dato del enunciado. */
  tipoAtEp: number;
  /** Tipo de retencion del IRPF, en %. Dato del enunciado. */
  tipoIrpf: number;
  /** Por defecto, true. */
  cotizaFogasa?: boolean;
}

export interface LineaCuota {
  concepto: string;
  base: number;
  tipo: number;
  importe: number;
}

export interface ResultadoNomina {
  devengos: {
    salariales: number;
    horasExtra: number;
    prorrataPagasAbonada: number;
    noSalariales: number;
    total: number;
  };
  bases: {
    remuneracionMensual: number;
    prorrataPagas: number;
    excesoNoExento: number;
    /** Base de contingencias comunes antes de aplicar limites. */
    contingenciasComunesSinLimites: number;
    baseMinima: number;
    baseMaxima: number;
    contingenciasComunes: number;
    topeMinimo: number;
    topeMaximo: number;
    contingenciasProfesionales: number;
    horasExtraFuerzaMayor: number;
    horasExtraResto: number;
    irpf: number;
  };
  deduccionesTrabajador: LineaCuota[];
  totalAportacionesTrabajador: number;
  retencionIrpf: LineaCuota;
  totalDeducir: number;
  liquido: number;
  aportacionEmpresa: LineaCuota[];
  totalAportacionEmpresa: number;
  costeTotal: number;
}

/** Gastos de locomocion con vehiculo propio: parte exenta y exceso computable. */
export function calcularLocomocion(
  km: number,
  eurosPorKm: number,
  parametros: ParametrosCotizacion,
): { abonado: number; exento: number; exceso: number } {
  const abonado = redondearCentimos(km * eurosPorKm);
  const limite = redondearCentimos(km * parametros.locomocionExentaKm.valor);
  const exento = Math.min(abonado, limite);
  return { abonado, exento, exceso: redondearCentimos(abonado - exento) };
}

function sumar(importes: number[]): number {
  return redondearCentimos(importes.reduce((total, importe) => total + importe, 0));
}

function acotar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

function cuota(concepto: string, base: number, tipo: number): LineaCuota {
  return { concepto, base, tipo, importe: redondearCentimos((base * tipo) / 100) };
}

function limitesDelGrupo(datos: DatosNomina, p: ParametrosCotizacion) {
  let baseMaxima: number;
  let baseMinima: number;
  if (datos.grupo <= 7) {
    const bases = p.basesMensuales.valor[datos.grupo as 1 | 2 | 3 | 4 | 5 | 6 | 7];
    baseMinima = bases.minima;
    baseMaxima = bases.maxima;
  } else {
    baseMinima = redondearCentimos(p.basesDiarias.valor.minima * datos.diasPeriodo);
    baseMaxima = redondearCentimos(p.basesDiarias.valor.maxima * datos.diasPeriodo);
  }
  let topeMinimo = p.topeMinimoMensual.valor;
  // Tiempo parcial: el minimo es horas trabajadas x base minima por hora.
  // El maximo no se reduce.
  if (datos.horasMesTiempoParcial !== undefined) {
    baseMinima = redondearCentimos(datos.horasMesTiempoParcial * p.baseMinimaHora.valor[datos.grupo]);
    topeMinimo = baseMinima;
  }
  return { baseMinima, baseMaxima, topeMinimo, topeMaximo: p.topeMaximoMensual.valor };
}

export function calcularNomina(datos: DatosNomina, p: ParametrosCotizacion): ResultadoNomina {
  const heFuerzaMayor = redondearCentimos(datos.horasExtraFuerzaMayor ?? 0);
  const heResto = redondearCentimos(datos.horasExtraResto ?? 0);
  const noSalariales = datos.percepcionesNoSalariales ?? [];

  // Devengos
  const salariales = sumar(datos.percepcionesSalariales.map((x) => x.importe));
  const horasExtra = sumar([heFuerzaMayor, heResto]);
  const prorrataPagas = redondearCentimos((datos.pagasExtra.numero * datos.pagasExtra.importe) / 12);
  const prorrataPagasAbonada = datos.pagasExtra.prorrateadas ? prorrataPagas : 0;
  const totalNoSalariales = sumar(noSalariales.map((x) => x.importe));
  const totalDevengado = sumar([salariales, horasExtra, prorrataPagasAbonada, totalNoSalariales]);

  // Bases de cotizacion
  const exentos = sumar(noSalariales.map((x) => x.exento));
  const excesoNoExento = redondearCentimos(totalNoSalariales - exentos);
  const limites = limitesDelGrupo(datos, p);
  const ccSinLimites = sumar([salariales, prorrataPagas, excesoNoExento]);
  const baseCc = acotar(ccSinLimites, limites.baseMinima, limites.baseMaxima);
  const baseCp = acotar(sumar([ccSinLimites, horasExtra]), limites.topeMinimo, limites.topeMaximo);
  const baseIrpf = redondearCentimos(totalDevengado - exentos);

  const desempleo =
    datos.contrato === "indefinido" ? p.desempleoIndefinido.valor : p.desempleoDuracionDeterminada.valor;

  const lineas: { concepto: string; base: number; tipo: TipoRepartido; incluir: boolean }[] = [
    { concepto: "Contingencias comunes", base: baseCc, tipo: p.contingenciasComunes.valor, incluir: true },
    {
      concepto: "Accidentes de trabajo y enfermedades profesionales",
      base: baseCp,
      tipo: { empresa: datos.tipoAtEp, trabajador: 0 },
      incluir: true,
    },
    { concepto: "Desempleo", base: baseCp, tipo: desempleo, incluir: true },
    { concepto: "FOGASA", base: baseCp, tipo: p.fogasa.valor, incluir: datos.cotizaFogasa ?? true },
    { concepto: "Formacion profesional", base: baseCp, tipo: p.formacionProfesional.valor, incluir: true },
    {
      concepto: "Horas extraordinarias de fuerza mayor",
      base: heFuerzaMayor,
      tipo: p.horasExtraFuerzaMayor.valor,
      incluir: heFuerzaMayor > 0,
    },
    {
      concepto: "Horas extraordinarias (no fuerza mayor)",
      base: heResto,
      tipo: p.horasExtraResto.valor,
      incluir: heResto > 0,
    },
    { concepto: "MEI", base: baseCc, tipo: p.mei.valor, incluir: true },
  ];

  const deduccionesTrabajador = lineas
    .filter((l) => l.incluir && l.tipo.trabajador > 0)
    .map((l) => cuota(l.concepto, l.base, l.tipo.trabajador));
  const aportacionEmpresa = lineas
    .filter((l) => l.incluir && l.tipo.empresa > 0)
    .map((l) => cuota(l.concepto, l.base, l.tipo.empresa));

  const totalAportacionesTrabajador = sumar(deduccionesTrabajador.map((l) => l.importe));
  const retencionIrpf = cuota("Retencion del IRPF", baseIrpf, datos.tipoIrpf);
  const totalDeducir = sumar([totalAportacionesTrabajador, retencionIrpf.importe]);
  const totalAportacionEmpresa = sumar(aportacionEmpresa.map((l) => l.importe));

  return {
    devengos: {
      salariales,
      horasExtra,
      prorrataPagasAbonada,
      noSalariales: totalNoSalariales,
      total: totalDevengado,
    },
    bases: {
      remuneracionMensual: salariales,
      prorrataPagas,
      excesoNoExento,
      contingenciasComunesSinLimites: ccSinLimites,
      baseMinima: limites.baseMinima,
      baseMaxima: limites.baseMaxima,
      contingenciasComunes: baseCc,
      topeMinimo: limites.topeMinimo,
      topeMaximo: limites.topeMaximo,
      contingenciasProfesionales: baseCp,
      horasExtraFuerzaMayor: heFuerzaMayor,
      horasExtraResto: heResto,
      irpf: baseIrpf,
    },
    deduccionesTrabajador,
    totalAportacionesTrabajador,
    retencionIrpf,
    totalDeducir,
    liquido: redondearCentimos(totalDevengado - totalDeducir),
    aportacionEmpresa,
    totalAportacionEmpresa,
    costeTotal: sumar([totalDevengado, totalAportacionEmpresa]),
  };
}
