import type { ParametrosCotizacion, TipoRepartido } from "../parametros/tipos";
import type { Percepcion } from "./nomina";
import { redondearCentimos } from "./redondeo";

// Nomina de un contrato de formacion en alternancia (art. 46 de la orden de
// cotizacion), mes completo y sin horas extra.
//
// Solo cubre la regla primera: retribucion que no supera la base minima
// mensual. Si la supera (regla segunda, cuotas unicas mas tipos sobre el
// exceso) el motor se niega a calcular en vez de dar una cifra incorrecta.

export interface DatosNominaAlternancia {
  percepcionesSalariales: Percepcion[];
  pagasExtra: { numero: number; importe: number; prorrateadas: boolean };
  /** Tipo de retencion del IRPF, en %. Dato del enunciado. */
  tipoIrpf: number;
}

export interface LineaAlternancia {
  concepto: string;
  /** "cuota_unica": importe fijo. "tipo": porcentaje sobre la base minima. */
  regimen: "cuota_unica" | "tipo";
  base?: number;
  tipo?: number;
  importe: number;
}

export interface ResultadoNominaAlternancia {
  devengos: { salariales: number; prorrataPagasAbonada: number; total: number };
  /** Retribucion computable (con prorrata de pagas) que se compara con la base minima. */
  retribucionComputable: number;
  baseMinima: number;
  baseIrpf: number;
  deduccionesTrabajador: LineaAlternancia[];
  totalAportacionesTrabajador: number;
  retencionIrpf: number;
  totalDeducir: number;
  liquido: number;
  aportacionEmpresa: LineaAlternancia[];
  totalAportacionEmpresa: number;
  costeTotal: number;
}

function sumar(importes: number[]): number {
  return redondearCentimos(importes.reduce((total, importe) => total + importe, 0));
}

export function calcularNominaAlternancia(
  datos: DatosNominaAlternancia,
  p: ParametrosCotizacion,
): ResultadoNominaAlternancia {
  const salariales = sumar(datos.percepcionesSalariales.map((x) => x.importe));
  const prorrataPagas = redondearCentimos((datos.pagasExtra.numero * datos.pagasExtra.importe) / 12);
  const prorrataPagasAbonada = datos.pagasExtra.prorrateadas ? prorrataPagas : 0;
  const totalDevengado = sumar([salariales, prorrataPagasAbonada]);

  const baseMinima = p.topeMinimoMensual.valor;
  const retribucionComputable = sumar([salariales, prorrataPagas]);
  if (retribucionComputable > baseMinima) {
    throw new Error(
      "La retribucion supera la base minima mensual: se aplica la regla segunda del art. 46, que este motor todavia no calcula.",
    );
  }

  const cuotas = p.alternanciaCuotasUnicas.valor;
  const lineas: { concepto: string; regimen: "cuota_unica" | "tipo"; reparto: TipoRepartido }[] = [
    { concepto: "Contingencias comunes", regimen: "cuota_unica", reparto: cuotas.contingenciasComunes },
    { concepto: "Contingencias profesionales", regimen: "cuota_unica", reparto: cuotas.contingenciasProfesionales },
    { concepto: "FOGASA", regimen: "cuota_unica", reparto: cuotas.fogasa },
    { concepto: "Formacion profesional", regimen: "cuota_unica", reparto: cuotas.formacionProfesional },
    { concepto: "Desempleo", regimen: "tipo", reparto: p.desempleoIndefinido.valor },
    { concepto: "MEI", regimen: "tipo", reparto: p.mei.valor },
  ];

  const linea = (
    l: (typeof lineas)[number],
    parte: "empresa" | "trabajador",
  ): LineaAlternancia =>
    l.regimen === "cuota_unica"
      ? { concepto: l.concepto, regimen: l.regimen, importe: l.reparto[parte] }
      : {
          concepto: l.concepto,
          regimen: l.regimen,
          base: baseMinima,
          tipo: l.reparto[parte],
          importe: redondearCentimos((baseMinima * l.reparto[parte]) / 100),
        };

  const deduccionesTrabajador = lineas.filter((l) => l.reparto.trabajador > 0).map((l) => linea(l, "trabajador"));
  const aportacionEmpresa = lineas.filter((l) => l.reparto.empresa > 0).map((l) => linea(l, "empresa"));

  const totalAportacionesTrabajador = sumar(deduccionesTrabajador.map((l) => l.importe));
  const retencionIrpf = redondearCentimos((totalDevengado * datos.tipoIrpf) / 100);
  const totalDeducir = sumar([totalAportacionesTrabajador, retencionIrpf]);
  const totalAportacionEmpresa = sumar(aportacionEmpresa.map((l) => l.importe));

  return {
    devengos: { salariales, prorrataPagasAbonada, total: totalDevengado },
    retribucionComputable,
    baseMinima,
    baseIrpf: totalDevengado,
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
