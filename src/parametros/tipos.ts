/** Un valor legal siempre viaja con su fuente y la fecha en que se comprobó. */
export interface ValorLegal<T> {
  valor: T;
  fuente: string;
  verificado: string;
}

/** Reparto de un tipo de cotización (en %) entre empresa y persona trabajadora. */
export interface TipoRepartido {
  empresa: number;
  trabajador: number;
}

export type GrupoCotizacion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface ParametrosCotizacion {
  ejercicio: number;
  /** Tope máximo mensual de la base de cotización. */
  topeMaximoMensual: ValorLegal<number>;
  /** Tope mínimo mensual para contingencias profesionales. */
  topeMinimoMensual: ValorLegal<number>;
  /** Bases mínimas y máximas mensuales, grupos 1 a 7. */
  basesMensuales: ValorLegal<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, { minima: number; maxima: number }>>;
  /** Bases mínima y máxima diarias, grupos 8 a 11. */
  basesDiarias: ValorLegal<{ minima: number; maxima: number }>;
  /** Base mínima por hora en contratos a tiempo parcial. */
  baseMinimaHora: ValorLegal<Record<GrupoCotizacion, number>>;
  contingenciasComunes: ValorLegal<TipoRepartido>;
  horasExtraFuerzaMayor: ValorLegal<TipoRepartido>;
  horasExtraResto: ValorLegal<TipoRepartido>;
  desempleoIndefinido: ValorLegal<TipoRepartido>;
  desempleoDuracionDeterminada: ValorLegal<TipoRepartido>;
  fogasa: ValorLegal<TipoRepartido>;
  formacionProfesional: ValorLegal<TipoRepartido>;
  mei: ValorLegal<TipoRepartido>;
  /**
   * Contrato de formación en alternancia, cuando la base no supera la mínima:
   * cuotas únicas mensuales en euros. El desempleo y el MEI no son cuotas
   * fijas: se aplican por tipos sobre la base mínima.
   */
  alternanciaCuotasUnicas: ValorLegal<{
    contingenciasComunes: TipoRepartido;
    contingenciasProfesionales: TipoRepartido;
    fogasa: TipoRepartido;
    formacionProfesional: TipoRepartido;
  }>;
  /** Euros por kilómetro exentos en gastos de locomoción con vehículo propio. */
  locomocionExentaKm: ValorLegal<number>;
}
