# Plugin «obradoiro-xestion»

Herramientas de Claude Code para ampliar y mantener la web Obradoiro de Xestión.

## Qué incluye

| Pieza | Nombre | Para qué sirve | Orden del docente |
|---|---|---|---|
| Skill | `novo-simulador` | Crea un simulador completo: parámetros, motor, pruebas y pantalla. | SIMULADOR \<nombre\> |
| Skill | `actualizar-parametros-legais` | Verifica en fuentes oficiales los valores legales de un año y los actualiza. | PARÁMETROS \<año\> |
| Skill | `xerar-suposto` | Genera un supuesto en galego con la solución calculada por el motor. | SUPOSTO \<simulador\> |
| Agente | `verificador-normativo` | Contrasta cada cifra legal con BOE, DOG, Seguridad Social o AEAT. | REVISAR |
| Agente | `revisor-pedagoxico` | Comprueba la correspondencia con RA y CE del módulo, el galego y la claridad. | REVISAR |
| Hook | `pasar-probas` | Pasa `npm test` solo, tras cada cambio en `src/motor` o `src/parametros`. | (automático) |

## Estructura

```
plugin/obradoiro-xestion/
  .claude-plugin/plugin.json      ficha del plugin
  skills/<nombre>/SKILL.md        una carpeta por skill
  skills/xerar-suposto/scripts/   script que ejecuta el motor con los datos de un supuesto
  agents/<nombre>.md              un archivo por agente
  hooks/hooks.json                cuando se dispara el hook
  hooks/pasar-probas.mjs          que hace el hook
```

El archivo `.claude-plugin/marketplace.json` de la raíz del repositorio lo convierte en un catálogo desde el que Claude Code puede instalar el plugin.

## Instalación

Desde Claude Code, una vez subido el repositorio a GitHub:

```
/plugin marketplace add alejandrorc-lA/obradoiro-xestion
/plugin install obradoiro-xestion@obradoiro
```

## Requisitos

Node.js y las dependencias del proyecto instaladas (`npm install`). El hook y el script de supuestos solo actúan dentro de un proyecto con la estructura del Obradoiro.
