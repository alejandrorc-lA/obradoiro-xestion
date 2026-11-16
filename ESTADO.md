# Estado del proyecto

Última actualización: 2026-11-16

## Tarea 1 — Base del proyecto (terminada)

Proyecto en Documentos, Node.js 26 y Git instalados, repositorio en la rama `main`. Identidad de git «Alexiño», solo en este repositorio. Todavía no hay repositorio en GitHub (tarea 4).

## Tarea 2 — Motor de nómina (terminada para el procedimiento ordinario)

Hecho:

- `src/parametros/2026.ts`: bases, topes y tipos del Régimen General 2026, verificados el 2026-11-15 en la Orden PJC/297/2026 (BOE-A-2026-7296), cada uno con su artículo.
- `src/motor/nomina.ts`: devengos, bases (CC, CP, horas extra, IRPF) con comprobación de límites, deducciones, aportación empresarial, líquido y coste total. Incluye tiempo parcial, horas extra, locomoción y opción sin FOGASA.
- `tests/nomina.test.ts`: las nóminas 1, 3 y 4 del docente coinciden al céntimo en todas sus cifras. Build correcto.

Puntos abiertos:

1. **Nómina 2 (formación en alternancia): implementada según la Orden** por decisión del docente (`src/motor/alternancia.ts`). Además de las cuotas únicas de la solución original, aplica formación profesional (2,16 y 0,28), desempleo y MEI sobre la base mínima (art. 46, confirmado con citas literales). Resultado para Brais: líquido 908,99 y coste 1.106,23, frente a 933,49 y 1.015,05 de la solución original. **El docente dio por buenas las cifras del motor el 2026-11-16**; queda de su parte actualizar su documento de solución. Solo cubre la regla primera (retribución que no supera la base mínima); si la supera, el motor da error en vez de calcular.
2. **Mínimo en tiempo parcial.** La solución usa base mínima × coeficiente (1.424,40 × 0,30 = 427,32). El art. 39 de la Orden lo calcula como horas trabajadas × base mínima por hora (8,58 en grupos 4 a 11). El motor sigue la Orden. En la nómina 3 el resultado no cambia, pero la cifra de comprobación sí. **El docente dio por bueno el criterio de la Orden y confirmó las 52 horas del mes el 2026-11-16.**
3. **Locomoción, 0,26 €/km.** Verificado en la Orden HFP/792/2023; no se comprobó de forma exhaustiva que no haya revisión posterior.

Fuera de alcance del motor por ahora: incapacidad temporal, meses incompletos, cotización de solidaridad, cálculo del tipo de IRPF (es un dato de entrada).

Nota: la carpeta `ejemplos nóminas` está excluida de git porque son soluciones docentes y el repositorio se publicará.

## Tarea 3 — Simulador de nómina (primera versión)

- `src/simuladores/nomina/nomina.ts`: formulario del supuesto, modo alumnado (escribe nueve resultados y comprueba cuáles acierta, sin ver la solución) y modo docente (recibo resuelto completo y generador de supuestos aleatorios). Portada con enlace al simulador.
- Pruebas y build correctos. El docente probó la pantalla en el navegador el 2026-11-15 y la dio por buena.
- No incluye todavía el contrato de formación en alternancia (el motor sí lo calcula).

## Tarea 4 — Publicación (terminada)

- Repositorio público: https://github.com/alejandrorc-lA/obradoiro-xestion. Código subido el 2026-11-15.
- Los commits usan la dirección anónima de GitHub del docente, no su correo personal.
- `.github/workflows/pages.yml` pasa las pruebas, construye y publica en cada subida a `main`.
- Dirección de la web: https://alejandrorc-la.github.io/obradoiro-xestion/
- El docente confirmó el 2026-11-15 que la web abre correctamente en esa dirección.

## Tarea 5 — Plugin «obradoiro-xestion» (escrito; falta instalarlo y supervisarlo)

Hecho el 2026-11-16, en `plugin/obradoiro-xestion/` (explicado en su `README.md`):

- Skills `novo-simulador`, `actualizar-parametros-legais` y `xerar-suposto`.
- Agentes `verificador-normativo` y `revisor-pedagoxico` (solo leen e informan).
- Hook `pasar-probas`: pasa `npm test` tras cada edición en `src/motor` o `src/parametros`.
- Script `skills/xerar-suposto/scripts/calcular.mjs`: ejecuta el motor con los datos de un supuesto.
- `.claude-plugin/marketplace.json` en la raíz, para poder instalar el plugin desde el repositorio de GitHub.
- La carpeta `supostos/` queda excluida de git (soluciones en un repositorio público).

Verificado:

- El script de supuestos reproduce la nómina 1 del docente (líquido 1.492,23).
- El hook, ejecutado a mano: pasa las pruebas al editar motor o parámetros, no hace nada con otros archivos y avisa con el resultado real cuando una prueba falla (fallo provocado y retirado).
- `npm test` (27 pruebas) y `npm run build` correctos.

Sin verificar:

- El plugin está subido a GitHub y activado para este proyecto en `.claude/settings.json`. En la sesión del 2026-11-16 se vio que **no cargaba**: estaba declarado pero nunca se había instalado en el equipo (la aplicación de escritorio no lo instala sola). Ese mismo día se instaló a mano con `claude plugin marketplace add` y `claude plugin install --scope project`; `claude plugin list` lo muestra instalado y activado (versión 0.1.0). El plugin pasa `claude plugin validate`.
- En una sesión nueva (2026-11-16) se comprobó que **el plugin carga**: aparecen las tres skills y los dos agentes. **Falta ver que el hook se dispara solo** al editar el motor o los parámetros.
- La copia instalada sale de GitHub, no de la carpeta local: tras cambiar algo en `plugin/` hay que subirlo y actualizar el plugin instalado para que surta efecto.
- La orden `claude` no está en el PATH; el programa está dentro de la aplicación de escritorio (`AppData\Local\Claude-Data\...\claude-code\<versión>\claude.exe`).
- Las skills y los agentes no se han usado aún en un caso real. El docente tiene pendiente leerlos y dar el visto bueno a su contenido.

## Revisión del simulador de nómina (2026-11-16)

Primera vez que se usan los dos agentes del plugin en un caso real. Solo leyeron e informaron; no se cambió código.

Normativa (`verificador-normativo`):

- **Todas las cifras de `src/parametros/2026.ts` coinciden** con la Orden PJC/297/2026 (BOE-A-2026-7296), y los 0,26 €/km con la Orden HFP/792/2023, sin revisión posterior localizada. Límite: el agente leyó el BOE por extractos; no pudo confirmar que las modificaciones del Reglamento del IRPF de sept.-oct. de 2026 no toquen el art. 9, ni abrió la AEAT.
- Por encima del tope máximo (5.101,20) el simulador recorta la base y no calcula ni avisa de la cotización adicional de solidaridad (art. 17 de la Orden). Comprobado en `src/motor/nomina.ts`.
- Dudas sin resolver (no verificadas en la norma): en grupos 8 a 11 con meses de 31 o 28 días, la base de comunes va por días y los topes de profesionales son mensuales fijos; prorrata de pagas entre 12 también en grupos de retribución diaria (el art. 1.1 habla de 365); tope mínimo de profesionales a tiempo parcial; que el SMI (1.221) más un sexto da 1.424,50 frente al 1.424,40 que fija el art. 2.2.
- El generador de supuestos lleva el 0,26 escrito a mano (`src/simuladores/nomina/nomina.ts`, línea 222) en vez de leerlo de parámetros.

Pedagogía (`revisor-pedagoxico`), fallos comprobados en el código del simulador:

- Las marcas de corrección no se borran al cambiar los datos del supuesto.
- Un importe escrito con punto de millares («1.492,23») se marca como error.
- El alumnado no puede generar supuestos: el botón solo está en modo docente y muestra la solución.
- La corrección solo dice «Revisa este cálculo»; el agente propone una pista por campo.
- Galego y etiquetas: «Orden» en castellano en la nota, «Cotiza a FOGASA», «Horas extra»/«pagas extra» frente a «extraordinarias», etiquetas ambiguas, y mejoras de accesibilidad.
- Currículo: encaja con CA4.5, CA4.6 y CA4.7 de MP0652 (Decreto 206/2012), CE4.4 y CE4.5 de MP0442 (Decreto 191/2010) y CA3.3 de FOL. Los textos de los criterios hay que cotejarlos con el DOG antes de copiarlos. Sin verificar: si FOL sigue vigente en 2026-27 o lo sustituye otro módulo.
- Pendiente de que el docente diga para qué módulo y ciclo es el simulador.

## Siguiente paso

Corregir en el simulador de nómina lo que el docente apruebe de la revisión (empezando por los cuatro fallos del modo alumnado y el aviso al superar el tope máximo) y comprobar de paso que el hook se dispara solo. Después, tarea 6 (nuevos simuladores).
