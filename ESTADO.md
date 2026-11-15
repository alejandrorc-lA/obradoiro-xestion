# Estado del proyecto

Última actualización: 2026-11-15

## Tarea 1 — Base del proyecto (terminada)

Proyecto en Documentos, Node.js 26 y Git instalados, repositorio en la rama `main`. Identidad de git «Alexiño», solo en este repositorio. Todavía no hay repositorio en GitHub (tarea 4).

## Tarea 2 — Motor de nómina (terminada para el procedimiento ordinario)

Hecho:

- `src/parametros/2026.ts`: bases, topes y tipos del Régimen General 2026, verificados el 2026-11-15 en la Orden PJC/297/2026 (BOE-A-2026-7296), cada uno con su artículo.
- `src/motor/nomina.ts`: devengos, bases (CC, CP, horas extra, IRPF) con comprobación de límites, deducciones, aportación empresarial, líquido y coste total. Incluye tiempo parcial, horas extra, locomoción y opción sin FOGASA.
- `tests/nomina.test.ts`: las nóminas 1, 3 y 4 del docente coinciden al céntimo en todas sus cifras. Build correcto.

Puntos abiertos:

1. **Nómina 2 (formación en alternancia): implementada según la Orden** por decisión del docente (`src/motor/alternancia.ts`). Además de las cuotas únicas de la solución original, aplica formación profesional (2,16 y 0,28), desempleo y MEI sobre la base mínima (art. 46, confirmado con citas literales). Resultado para Brais: líquido 908,99 y coste 1.106,23, frente a 933,49 y 1.015,05 de la solución original. Falta que el docente contraste estas cifras y actualice su documento de solución. Solo cubre la regla primera (retribución que no supera la base mínima); si la supera, el motor da error en vez de calcular.
2. **Mínimo en tiempo parcial.** La solución usa base mínima × coeficiente (1.424,40 × 0,30 = 427,32). El art. 39 de la Orden lo calcula como horas trabajadas × base mínima por hora (8,58 en grupos 4 a 11). El motor sigue la Orden. En la nómina 3 el resultado no cambia, pero la cifra de comprobación sí; además falta el dato real de horas del mes (la prueba usa 52 como estimación).
3. **Locomoción, 0,26 €/km.** Verificado en la Orden HFP/792/2023; no se comprobó de forma exhaustiva que no haya revisión posterior.

Fuera de alcance del motor por ahora: incapacidad temporal, meses incompletos, cotización de solidaridad, cálculo del tipo de IRPF (es un dato de entrada).

Nota: la carpeta `ejemplos nóminas` está excluida de git porque son soluciones docentes y el repositorio se publicará.

## Tarea 3 — Simulador de nómina (primera versión)

- `src/simuladores/nomina/nomina.ts`: formulario del supuesto, modo alumnado (escribe nueve resultados y comprueba cuáles acierta, sin ver la solución) y modo docente (recibo resuelto completo y generador de supuestos aleatorios). Portada con enlace al simulador.
- Pruebas y build correctos. El docente probó la pantalla en el navegador el 2026-11-15 y la dio por buena.
- No incluye todavía el contrato de formación en alternancia (el motor sí lo calcula).

## Tarea 4 — Publicación (en curso)

- Repositorio público: https://github.com/alejandrorc-lA/obradoiro-xestion. Código subido el 2026-11-15.
- Los commits usan la dirección anónima de GitHub del docente, no su correo personal.
- `.github/workflows/pages.yml` pasa las pruebas, construye y publica en cada subida a `main`.
- Dirección prevista de la web: https://alejandrorc-la.github.io/obradoiro-xestion/

## Siguiente tarea

Tarea 5 — plugin «obradoiro-xestion» (skills, agentes y hook).
