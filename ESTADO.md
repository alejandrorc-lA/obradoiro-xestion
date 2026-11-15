# Estado del proyecto

Última actualización: 2026-11-15

## Tarea 1 — Base del proyecto (terminada)

Proyecto en Documentos, Node.js 26 y Git instalados, repositorio en la rama `main`. Identidad de git «Alexiño», solo en este repositorio. Todavía no hay repositorio en GitHub (tarea 4).

## Tarea 2 — Motor de nómina (terminada para el procedimiento ordinario)

Hecho:

- `src/parametros/2026.ts`: bases, topes y tipos del Régimen General 2026, verificados el 2026-11-15 en la Orden PJC/297/2026 (BOE-A-2026-7296), cada uno con su artículo.
- `src/motor/nomina.ts`: devengos, bases (CC, CP, horas extra, IRPF) con comprobación de límites, deducciones, aportación empresarial, líquido y coste total. Incluye tiempo parcial, horas extra, locomoción y opción sin FOGASA.
- `tests/nomina.test.ts`: las nóminas 1, 3 y 4 del docente coinciden al céntimo en todas sus cifras. 20 pruebas de 20 pasan; build correcto.

Pendiente de decisión del docente:

1. **Nómina 2 (formación en alternancia), no implementada.** La solución del docente solo recoge las cuotas únicas de contingencias comunes (69,23), profesionales (7,95) y FOGASA (4,38), que coinciden con el art. 46 de la Orden. Pero ese artículo añade formación profesional (2,44: 2,16 empresa y 0,28 trabajador), desempleo sobre la base mínima al tipo de contrato indefinido y MEI sobre la base mínima. Hay que decidir si el motor sigue la Orden completa o la versión simplificada de la solución.
2. **Mínimo en tiempo parcial.** La solución usa base mínima × coeficiente (1.424,40 × 0,30 = 427,32). El art. 39 de la Orden lo calcula como horas trabajadas × base mínima por hora (8,58 en grupos 4 a 11). El motor sigue la Orden. En la nómina 3 el resultado no cambia, pero la cifra de comprobación sí; además falta el dato real de horas del mes (la prueba usa 52 como estimación).
3. **Locomoción, 0,26 €/km.** Verificado en la Orden HFP/792/2023; no se comprobó de forma exhaustiva que no haya revisión posterior.

Fuera de alcance del motor por ahora: incapacidad temporal, meses incompletos, cotización de solidaridad, cálculo del tipo de IRPF (es un dato de entrada).

Nota: la carpeta `ejemplos nóminas` está excluida de git porque son soluciones docentes y el repositorio se publicará.

## Siguiente tarea

Tarea 3 — Simulador de nómina (pantalla con modo alumnado y modo docente) sobre este motor.
