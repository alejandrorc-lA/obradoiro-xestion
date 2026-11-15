# Parámetros legales

Un archivo por año (`2026.ts`, `2027.ts`…), con la forma definida en `tipos.ts`.

Cada valor lleva siempre tres datos:

```ts
{
  valor: 0,                 // la cifra
  fuente: "BOE-A-AAAA-NNNN", // norma o página oficial donde se comprobó
  verificado: "AAAA-MM-DD",  // fecha de la comprobación
}
```

Un valor que no se haya podido comprobar se escribe con `fuente: "PENDIENTE"` y no se usa en ningún simulador publicado.
