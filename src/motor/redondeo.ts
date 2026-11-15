/**
 * Redondea un importe a céntimos (dos decimales), con redondeo comercial:
 * el medio céntimo sube. Todos los importes del motor pasan por aquí.
 */
export function redondearCentimos(importe: number): number {
  const signo = importe < 0 ? -1 : 1;
  const absoluto = Math.abs(importe);
  // toFixed(8) elimina el ruido binario (1.005 * 100 = 100.49999999999999).
  const centimos = Math.round(Number((absoluto * 100).toFixed(8)));
  return (signo * centimos) / 100;
}
