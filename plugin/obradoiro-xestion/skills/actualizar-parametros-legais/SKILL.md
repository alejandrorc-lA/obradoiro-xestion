---
name: actualizar-parametros-legais
description: Verifica en fuentes oficiales (BOE, DOG, Seguridad Social, AEAT) y actualiza los valores legales de un ejercicio en src/parametros de la web Obradoiro de Xestión, y vuelve a pasar las pruebas. Usar cuando el docente escriba «PARÁMETROS <año>», pida actualizar o revisar bases, tipos, topes, SMI o tramos, en la revisión de cada enero, o cuando otro trabajo necesite una cifra legal nueva.
---

# Actualizar parámetros legais

Regla que manda sobre todo lo demás: **ninguna cifra legal se escribe de memoria.** Lo que recuerdes de una norma sirve solo para saber dónde buscar; el valor se copia de la fuente oficial abierta en ese momento.

## 1. Inventario

Lee `src/parametros/tipos.ts` y el archivo del último año. Haz la lista de todos los valores, con su fuente y fecha actuales. Si el año pedido no tiene archivo, se creará uno nuevo (`<año>.ts`) con la misma forma; el del año anterior no se toca, porque los supuestos antiguos siguen usándolo.

## 2. Verificación

Para cada valor, localiza la norma vigente en el ejercicio pedido y lee el artículo concreto. Puedes repartir el trabajo con el agente `verificador-normativo`.

Fuentes admitidas, por orden de preferencia:

1. Texto publicado en el **BOE** o el **DOG** (el identificador `BOE-A-AAAA-NNNN` y el artículo).
2. Páginas oficiales de la **Seguridad Social** (`seg-social.es`) y de la **AEAT** (`sede.agenciatributaria.gob.es`).

No valen como fuente blogs, asesorías, prensa ni resúmenes de terceros, aunque sirvan de pista para encontrar la norma.

Comprueba siempre:

- Que la norma está **vigente en ese ejercicio** y desde qué fecha tiene efectos (las órdenes de cotización suelen publicarse con el año empezado y efectos desde el 1 de enero).
- Que no hay una **corrección de errores** o una norma posterior que la modifique.
- Si todavía no se ha publicado la norma del año, que hay una **prórroga** expresa de la anterior. En ese caso se anota la norma que prorroga.

## 3. Lo que no se puede verificar

Se escribe con `fuente: "PENDIENTE"`, se conserva el último valor verificado solo si el motor lo necesita para funcionar, y se avisa al docente con la lista exacta. Un valor `PENDIENTE` no se usa en un simulador publicado.

## 4. Escritura

Cada valor en el archivo del año lleva sus tres datos:

```ts
{ valor: 0, fuente: "BOE-A-AAAA-NNNN (norma), art. N", verificado: "AAAA-MM-DD" }
```

La fecha es la del día en que se abrió la fuente, no la de publicación de la norma.

## 5. Pruebas

Ejecuta `npm test` y `npm run build`.

- Las pruebas de ejercicios de **años anteriores** deben seguir pasando sin cambios: usan el archivo de su año.
- Si un cambio de valor hace fallar una prueba del mismo año, no se modifica la prueba: se comunica al docente la cifra antigua, la nueva, la fuente y qué resultado cambia.

## 6. Informe al docente

Una tabla con: valor, cifra anterior, cifra nueva, fuente con artículo y estado (sin cambios, actualizado, PENDIENTE). Después, commit con mensaje en castellano sin tildes y actualización de `ESTADO.md`.

Publicar los parámetros nuevos requiere la confirmación del docente.
