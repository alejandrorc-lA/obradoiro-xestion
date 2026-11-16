---
name: xerar-suposto
description: Genera un supuesto práctico en galego normativo para el alumnado, con su solución calculada por el motor de la web Obradoiro de Xestión (nunca a mano). Usar cuando el docente escriba «SUPOSTO <simulador>» o pida un supuesto, ejercicio, caso práctico o enunciado de nómina, IRPF, cotizaciones, asientos, amortización o punto muerto.
---

# Xerar suposto

Produce dos documentos en galego normativo: el **enunciado** para el alumnado y la **solución** para el docente. Todas las cifras de la solución salen del motor.

## 1. Concretar el encargo

Pregunta solo lo que falte:

- Simulador y ejercicio (año de los parámetros).
- Nivel de dificultad y qué casos debe incluir (por ejemplo: horas extra, pagas prorrateadas, tiempo parcial).
- Cuántos supuestos.

Comprueba que el motor cubre lo pedido leyendo `src/motor/` y `ESTADO.md`. Si un caso está fuera de alcance (por ejemplo, incapacidad temporal), dilo y no lo incluyas: un supuesto que el motor no puede resolver no se entrega.

## 2. Inventar los datos

- Personas y empresas ficticias, con nombres gallegos verosímiles. Nunca datos de personas reales ni del alumnado.
- Importes realistas para el grupo de cotización y el sector.
- Los datos que dependen de una norma (salario de convenio, tipo de AT y EP de una actividad, tipo de IRPF) se dan en el enunciado como dato; no se presentan como la cifra oficial de un convenio o una tarifa reales salvo que se haya verificado en su fuente.

## 3. Calcular con el motor

Escribe los datos del supuesto en un archivo JSON con la forma exacta que pide la función del motor (por ejemplo, `DatosNomina` en `src/motor/nomina.ts`) y ejecuta, desde la raíz del proyecto, el script `scripts/calcular.mjs` que está en la carpeta de esta skill:

```bash
node "<carpeta de esta skill>/scripts/calcular.mjs" src/motor/nomina.ts calcularNomina 2026 supostos/datos-suposto-1.json
```

Los argumentos son: archivo del motor, función, año de los parámetros y archivo de datos. El script imprime el resultado completo del motor en JSON.

- Si el motor da error, corrige los datos del supuesto, no el motor.
- No ajustes, redondees ni completes ninguna cifra a mano. Si hace falta un dato que el motor no devuelve, se dice que falta.

## 4. Redactar

**Enunciado** (`supostos/<simulador>-<n>-enunciado.md`): contexto breve, datos ordenados y lo que se pide, con el mismo orden de pasos que el simulador. Sin ninguna cifra de la solución.

**Solución** (`supostos/<simulador>-<n>-solucion.md`): el desarrollo paso a paso con las cifras copiadas de la salida del motor, e indicación del año de los parámetros y de las normas que los respaldan (campo `fuente` de `src/parametros/`).

Galego normativo (RAG), tratamiento inclusivo y terminología del módulo: «recibo de salarios», «base de cotización», «cota», «retención».

## 5. Revisión y entrega

- Relee la solución contra la salida del motor, cifra a cifra.
- Indica al docente dónde están los archivos y cómo cargar los mismos datos en el simulador para comprobarlo en pantalla.
- La carpeta `supostos/` está excluida de git porque el repositorio es público y contiene soluciones. No la añadas a git sin que el docente lo pida.
