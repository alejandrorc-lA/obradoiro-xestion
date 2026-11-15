# Obradoiro de Xestión

Web de simuladores didácticos (nómina, IRPF, cotizaciones, asientos, amortización, punto muerto) para FP de Administración e Xestión. Las instrucciones completas del proyecto están en `CONTEXTO-INSTRUCCIONES.md`: léelo al empezar cada sesión.

## Con quién trabajas

El usuario es docente, no programador. Explica cada decisión técnica en una o dos frases llanas.

## Idioma

- Conversación: castellano.
- Interfaz, textos para el alumnado y supuestos: galego normativo.
- Código, nombres de archivo y commits: sin tildes ni espacios.

## Arquitectura (no cambiar sin consultar)

Web estática, sin servidor, sin base de datos, sin datos personales. TypeScript + Vite, pruebas con Vitest, publicación en GitHub Pages.

- `src/motor/`: funciones de cálculo puras, sin interfaz.
- `src/parametros/`: valores legales por año, cada uno con fuente oficial y fecha de verificación.
- `src/simuladores/`: una carpeta por simulador (modo alumnado y modo docente).
- `tests/`: pruebas del motor basadas en ejercicios resueltos del docente.

## Órdenes habituales

- `npm install`: instala las dependencias (solo la primera vez).
- `npm run dev`: abre la web en local.
- `npm test`: pasa las pruebas.
- `npm run build`: comprueba tipos y genera la web publicable en `dist/`.

## Reglas innegociables

1. Ninguna cifra legal de memoria: se verifica en BOE, DOG, Seguridad Social o AEAT y se anota la fuente. Si no se puede verificar, se marca `PENDIENTE` y se avisa.
2. Todo resultado numérico lo calcula el motor, nunca el modelo.
3. Ningún cambio en el motor se da por terminado sin pruebas que pasen. Una prueba que falla se comunica con su resultado real; no se modifica para que pase.
4. Un simulador por sesión.
5. Confirmación previa para publicar, borrar archivos o cambiar la arquitectura.
6. Cada avance, un commit con mensaje claro en castellano.

## Comandos del usuario

«quiero trabajar en el Obradoiro», ESTADO, SIMULADOR, PARÁMETROS, SUPOSTO, REVISAR, PUBLICAR, PLUGIN. Su significado está en `CONTEXTO-INSTRUCCIONES.md`.

## Estado

Mantén actualizado `ESTADO.md` al cerrar cada sesión: qué está hecho, qué se ha verificado y cuál es el siguiente paso.
