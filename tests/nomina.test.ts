import { describe, expect, it } from "vitest";
import { calcularLocomocion, calcularNomina, type DatosNomina, type LineaCuota } from "../src/motor/nomina";
import { parametros2026 } from "../src/parametros/2026";

// Casos tomados de las soluciones del docente (carpeta "ejemplos nóminas"),
// UD 4 de MP0652, periodo 01/11/2026 - 30/11/2026.
// La nomina 2 (contrato de formacion en alternancia) esta en alternancia.test.ts.

const importes = (lineas: LineaCuota[]) => lineas.map((l) => l.importe);

describe("Nomina 1 - Iria (grupo 9, horas extra, pagas no prorrateadas)", () => {
  const datos: DatosNomina = {
    grupo: 9,
    diasPeriodo: 30,
    contrato: "duracion_determinada",
    percepcionesSalariales: [
      { concepto: "Salario base", importe: 1290 },
      { concepto: "Plus de nocturnidad", importe: 210 },
      { concepto: "Plus de asistencia", importe: 60 },
    ],
    horasExtraResto: 6 * 14.5,
    pagasExtra: { numero: 2, importe: 1290, prorrateadas: false },
    tipoAtEp: 3.1,
    tipoIrpf: 2,
  };
  const r = calcularNomina(datos, parametros2026);

  it("devenga 1.647,00 sin incluir el prorrateo de pagas", () => {
    expect(r.devengos.total).toBe(1647);
  });

  it("calcula las bases y comprueba los limites del grupo", () => {
    expect(r.bases.remuneracionMensual).toBe(1560);
    expect(r.bases.prorrataPagas).toBe(215);
    expect(r.bases.contingenciasComunes).toBe(1775);
    expect(r.bases.baseMinima).toBe(1424.4);
    expect(r.bases.baseMaxima).toBe(5101.2);
    expect(r.bases.contingenciasProfesionales).toBe(1862);
    expect(r.bases.horasExtraResto).toBe(87);
    expect(r.bases.irpf).toBe(1647);
  });

  it("calcula las cinco deducciones de la trabajadora", () => {
    expect(importes(r.deduccionesTrabajador)).toEqual([83.43, 29.79, 1.86, 4.09, 2.66]);
    expect(r.totalAportacionesTrabajador).toBe(121.83);
    expect(r.retencionIrpf.importe).toBe(32.94);
    expect(r.totalDeducir).toBe(154.77);
    expect(r.liquido).toBe(1492.23);
  });

  it("calcula las siete aportaciones de la empresa y el coste total", () => {
    expect(importes(r.aportacionEmpresa)).toEqual([418.9, 57.72, 124.75, 3.72, 11.17, 20.53, 13.31]);
    expect(r.totalAportacionEmpresa).toBe(650.1);
    expect(r.costeTotal).toBe(2297.1);
  });
});

describe("Nomina 3 - Noelia (tiempo parcial, base mayor que el devengo)", () => {
  const datos: DatosNomina = {
    grupo: 9,
    diasPeriodo: 30,
    contrato: "duracion_determinada",
    // La solucion no indica las horas del mes (solo el coeficiente 0,30 y doce
    // horas semanales). El docente confirmo las 52 horas el 2026-11-16; el
    // resultado no depende de ellas mientras la base real (560,00) supere el
    // minimo.
    horasMesTiempoParcial: 52,
    percepcionesSalariales: [{ concepto: "Salario base", importe: 480 }],
    pagasExtra: { numero: 2, importe: 480, prorrateadas: false },
    tipoAtEp: 1.9,
    tipoIrpf: 0,
  };
  const r = calcularNomina(datos, parametros2026);

  it("devenga 480,00 y cotiza por 560,00", () => {
    expect(r.devengos.total).toBe(480);
    expect(r.bases.prorrataPagas).toBe(80);
    expect(r.bases.contingenciasComunes).toBe(560);
    expect(r.bases.contingenciasProfesionales).toBe(560);
    expect(r.bases.irpf).toBe(480);
  });

  it("reduce el minimo por la jornada pero no el maximo", () => {
    expect(r.bases.baseMinima).toBe(446.16);
    expect(r.bases.baseMinima).toBeLessThan(r.bases.contingenciasComunes);
    expect(r.bases.baseMaxima).toBe(5101.2);
  });

  it("calcula deducciones, IRPF al 0 % y liquido", () => {
    expect(importes(r.deduccionesTrabajador)).toEqual([26.32, 8.96, 0.56, 0.84]);
    expect(r.totalAportacionesTrabajador).toBe(36.68);
    expect(r.retencionIrpf.importe).toBe(0);
    expect(r.liquido).toBe(443.32);
  });

  it("calcula las seis aportaciones de la empresa y el coste total", () => {
    expect(importes(r.aportacionEmpresa)).toEqual([132.16, 10.64, 37.52, 1.12, 3.36, 4.2]);
    expect(r.totalAportacionEmpresa).toBe(189);
    expect(r.costeTotal).toBe(669);
  });
});

describe("Nomina 4 - Xoan Manuel (locomocion, tres magnitudes distintas)", () => {
  const locomocion = calcularLocomocion(300, 0.36, parametros2026);
  const datos: DatosNomina = {
    grupo: 5,
    diasPeriodo: 30,
    contrato: "duracion_determinada",
    percepcionesSalariales: [
      { concepto: "Salario base", importe: 1680 },
      { concepto: "Complemento especifico", importe: 320 },
    ],
    pagasExtra: { numero: 2, importe: 2000, prorrateadas: false },
    percepcionesNoSalariales: [
      { concepto: "Ayudas de locomocion", importe: locomocion.abonado, exento: locomocion.exento },
    ],
    tipoAtEp: 1.5,
    tipoIrpf: 9,
  };
  const r = calcularNomina(datos, parametros2026);

  it("separa la parte exenta de la locomocion", () => {
    expect(locomocion).toEqual({ abonado: 108, exento: 78, exceso: 30 });
  });

  it("obtiene devengo, base de cotizacion y base de IRPF distintos", () => {
    expect(r.devengos.total).toBe(2108);
    expect(r.bases.prorrataPagas).toBe(333.33);
    expect(r.bases.excesoNoExento).toBe(30);
    expect(r.bases.contingenciasComunes).toBe(2363.33);
    expect(r.bases.contingenciasProfesionales).toBe(2363.33);
    expect(r.bases.irpf).toBe(2030);
  });

  it("calcula deducciones, IRPF y liquido", () => {
    expect(importes(r.deduccionesTrabajador)).toEqual([111.08, 37.81, 2.36, 3.54]);
    expect(r.totalAportacionesTrabajador).toBe(154.79);
    expect(r.retencionIrpf.importe).toBe(182.7);
    expect(r.totalDeducir).toBe(337.49);
    expect(r.liquido).toBe(1770.51);
  });

  it("calcula las aportaciones de la entidad con FOGASA", () => {
    expect(importes(r.aportacionEmpresa)).toEqual([557.75, 35.45, 158.34, 4.73, 14.18, 17.72]);
    expect(r.totalAportacionEmpresa).toBe(788.17);
    expect(r.costeTotal).toBe(2896.17);
  });

  it("admite la variante sin FOGASA prevista en la solucion", () => {
    const sinFogasa = calcularNomina({ ...datos, cotizaFogasa: false }, parametros2026);
    expect(sinFogasa.totalAportacionEmpresa).toBe(783.44);
    expect(sinFogasa.costeTotal).toBe(2891.44);
  });
});

describe("Limites de la base", () => {
  const base: DatosNomina = {
    grupo: 1,
    diasPeriodo: 30,
    contrato: "indefinido",
    percepcionesSalariales: [{ concepto: "Salario base", importe: 6000 }],
    pagasExtra: { numero: 2, importe: 6000, prorrateadas: false },
    tipoAtEp: 1.5,
    tipoIrpf: 20,
  };

  it("aplica la base maxima cuando la remuneracion la supera", () => {
    const r = calcularNomina(base, parametros2026);
    expect(r.bases.contingenciasComunesSinLimites).toBe(7000);
    expect(r.bases.contingenciasComunes).toBe(5101.2);
    expect(r.bases.contingenciasProfesionales).toBe(5101.2);
  });

  it("aplica la base minima del grupo cuando la remuneracion no llega", () => {
    const r = calcularNomina(
      {
        ...base,
        percepcionesSalariales: [{ concepto: "Salario base", importe: 1500 }],
        pagasExtra: { numero: 2, importe: 1500, prorrateadas: false },
      },
      parametros2026,
    );
    expect(r.bases.contingenciasComunesSinLimites).toBe(1750);
    expect(r.bases.contingenciasComunes).toBe(1989.3);
  });

  it("usa el tipo de desempleo de contrato indefinido", () => {
    const r = calcularNomina(base, parametros2026);
    const desempleo = r.deduccionesTrabajador.find((l) => l.concepto === "Desempleo");
    expect(desempleo?.tipo).toBe(1.55);
  });
});
