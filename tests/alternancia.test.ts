import { describe, expect, it } from "vitest";
import { calcularNominaAlternancia, type DatosNominaAlternancia } from "../src/motor/alternancia";
import { parametros2026 } from "../src/parametros/2026";

// Nomina 2 del docente (Brais, contrato de formacion en alternancia).
//
// Por decision del docente, el motor sigue el art. 46 de la Orden PJC/297/2026
// completo, y no la solucion original, que omitia formacion profesional,
// desempleo y MEI. Por eso:
//  - "coincide con la solucion del docente": cifras de su documento.
//  - "segun la Orden": cifras calculadas a mano a partir del art. 46, todavia
//    no contrastadas con una nomina resuelta por el docente.

const datos: DatosNominaAlternancia = {
  percepcionesSalariales: [{ concepto: "Salario base", importe: 810 }],
  pagasExtra: { numero: 2, importe: 810, prorrateadas: true },
  tipoIrpf: 0,
};
const r = calcularNominaAlternancia(datos, parametros2026);
const importe = (lineas: typeof r.aportacionEmpresa, concepto: string) =>
  lineas.find((l) => l.concepto === concepto)?.importe;

describe("Nomina 2 - Brais: coincide con la solucion del docente", () => {
  it("devenga 945,00 con las pagas prorrateadas", () => {
    expect(r.devengos.prorrataPagasAbonada).toBe(135);
    expect(r.devengos.total).toBe(945);
    expect(r.baseIrpf).toBe(945);
    expect(r.retencionIrpf).toBe(0);
  });

  it("aplica las cuotas unicas de contingencias comunes, profesionales y FOGASA", () => {
    expect(importe(r.deduccionesTrabajador, "Contingencias comunes")).toBe(11.51);
    expect(importe(r.aportacionEmpresa, "Contingencias comunes")).toBe(57.72);
    expect(importe(r.aportacionEmpresa, "Contingencias profesionales")).toBe(7.95);
    expect(importe(r.aportacionEmpresa, "FOGASA")).toBe(4.38);
  });
});

describe("Nomina 2 - Brais: segun la Orden (art. 46)", () => {
  it("añade formacion profesional como cuota unica", () => {
    expect(importe(r.deduccionesTrabajador, "Formacion profesional")).toBe(0.28);
    expect(importe(r.aportacionEmpresa, "Formacion profesional")).toBe(2.16);
  });

  it("cotiza desempleo sobre la base minima al tipo de contrato indefinido", () => {
    // 1.424,40 x 1,55 % = 22,0782 ; 1.424,40 x 5,50 % = 78,342
    expect(importe(r.deduccionesTrabajador, "Desempleo")).toBe(22.08);
    expect(importe(r.aportacionEmpresa, "Desempleo")).toBe(78.34);
  });

  it("cotiza el MEI sobre la base minima", () => {
    // 1.424,40 x 0,15 % = 2,1366 ; 1.424,40 x 0,75 % = 10,683
    expect(importe(r.deduccionesTrabajador, "MEI")).toBe(2.14);
    expect(importe(r.aportacionEmpresa, "MEI")).toBe(10.68);
  });

  it("obtiene los totales, el liquido y el coste", () => {
    expect(r.totalAportacionesTrabajador).toBe(36.01);
    expect(r.totalDeducir).toBe(36.01);
    expect(r.liquido).toBe(908.99);
    expect(r.totalAportacionEmpresa).toBe(161.23);
    expect(r.costeTotal).toBe(1106.23);
  });
});

describe("Alternancia: limite de la regla primera", () => {
  it("se niega a calcular si la retribucion supera la base minima", () => {
    expect(() =>
      calcularNominaAlternancia(
        {
          percepcionesSalariales: [{ concepto: "Salario base", importe: 1300 }],
          pagasExtra: { numero: 2, importe: 1300, prorrateadas: true },
          tipoIrpf: 0,
        },
        parametros2026,
      ),
    ).toThrow(/regla segunda/);
  });
});
