---
name: novo-simulador
description: Crea un simulador nuevo en la web Obradoiro de Xestión (IRPF, cotizaciones, asientos contables, amortización, punto muerto u otro) siguiendo la estructura del proyecto, con motor de cálculo, pruebas, modo alumnado y modo docente. Usar cuando el docente escriba «SIMULADOR <nombre>» o pida crear, empezar o añadir un simulador.
---

# Novo simulador

Crea un simulador completo, de principio a fin, sin saltarse ningún paso. El docente no es programador: explica cada decisión técnica en una o dos frases llanas y en castellano.

## Antes de escribir código

1. Lee `CLAUDE.md` y `ESTADO.md`. Si hay otro simulador a medias, avisa y no empieces: la regla es un simulador por sesión.
2. Pide al docente, si no los ha dado ya:
   - **Ejercicios resueltos** del simulador (al menos dos, con todas las cifras intermedias). Son la base de las pruebas. Sin ellos no hay motor.
   - **Módulo y unidad** en que se usará, para la revisión pedagógica.
   - **Alcance**: qué casos cubre y cuáles quedan fuera en esta primera versión.
3. Haz la lista de **cifras legales** que necesita el cálculo (tipos, tramos, límites, coeficientes). No escribas ninguna de memoria: sigue la skill `actualizar-parametros-legais` o encarga la comprobación al agente `verificador-normativo`. Lo que no se pueda verificar se anota con `fuente: "PENDIENTE"` y se avisa al docente.

## Orden de trabajo

Cada paso termina con las pruebas pasando y un commit con mensaje en castellano, sin tildes.

### 1. Parámetros — `src/parametros/`

- Añade a `tipos.ts` la forma de los valores nuevos y al archivo del año (`2026.ts`…) cada cifra como `ValorLegal`: valor, fuente con artículo y fecha de verificación.
- Si el simulador no usa cifras legales (por ejemplo, punto muerto), sáltate este paso y dilo.

### 2. Motor — `src/motor/<nombre>.ts`

- Funciones puras: reciben los datos y los parámetros, devuelven el resultado. Nada de pantalla, ni fechas del sistema, ni números aleatorios.
- El resultado incluye las cifras intermedias (bases, líneas, totales), no solo la final: el modo docente las muestra y las pruebas las comprueban.
- Redondea con `redondearCentimos` de `src/motor/redondeo.ts`.
- Un caso que el motor no cubre lanza un error con un mensaje claro; nunca devuelve una cifra aproximada.
- Toma `src/motor/nomina.ts` como modelo de estilo.

### 3. Pruebas — `tests/<nombre>.test.ts`

- Un bloque `describe` por ejercicio resuelto del docente, comprobando al céntimo las cifras intermedias y finales.
- Si una prueba falla, **no se toca la prueba**: se comunica al docente la cifra esperada y la que da el motor, con la norma que explica la diferencia si la hay, y decide él.
- Ejecuta `npm test` y muestra el resultado real.

### 4. Pantalla — `src/simuladores/<ruta>/<ruta>.ts`

- Toma `src/simuladores/nomina/nomina.ts` como modelo: una función `montarSimulador<Nombre>(raiz: HTMLElement)`.
- **Modo alumnado**: el alumnado introduce sus resultados y la pantalla indica cuáles acierta, sin enseñar la solución.
- **Modo docente**: solución completa paso a paso y generador de supuestos.
- La pantalla llama al motor; nunca calcula por su cuenta.
- Textos de interfaz en galego normativo. Nombres de archivo, variables y comentarios sin tildes.
- Sin servidor, sin almacenar nada, sin pedir datos personales.

### 5. Portada — `src/main.ts`

Añade `montar` a la ficha del simulador en la lista `simuladores` (o crea la ficha si no existe).

### 6. Comprobación final

1. `npm test` y `npm run build`, los dos sin errores.
2. Lanza el agente `verificador-normativo` sobre los parámetros nuevos y el agente `revisor-pedagoxico` sobre el simulador. Traslada al docente sus conclusiones tal cual, sin suavizarlas.
3. Pide al docente que pruebe la pantalla con `npm run dev` antes de darla por buena.
4. Actualiza `ESTADO.md`: qué está hecho, qué se ha verificado, qué queda abierto.

## Lo que no se hace sin confirmación

Publicar (subir a `main` publica la web), borrar archivos y cambiar la arquitectura.
