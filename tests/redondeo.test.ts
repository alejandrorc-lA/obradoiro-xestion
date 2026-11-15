import { describe, expect, it } from "vitest";
import { redondearCentimos } from "../src/motor/redondeo";

describe("redondearCentimos", () => {
  it("deja igual un importe que ya tiene dos decimales", () => {
    expect(redondearCentimos(1234.56)).toBe(1234.56);
  });

  it("redondea hacia abajo por debajo del medio centimo", () => {
    expect(redondearCentimos(10.004)).toBe(10);
  });

  it("sube el medio centimo aunque el ordenador lo guarde con ruido", () => {
    expect(redondearCentimos(1.005)).toBe(1.01);
    expect(redondearCentimos(2.675)).toBe(2.68);
  });

  it("trata los negativos de forma simetrica", () => {
    expect(redondearCentimos(-1.005)).toBe(-1.01);
  });
});
