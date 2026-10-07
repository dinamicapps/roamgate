# Hotfix Fase 5: Filtros de seguridad obligatorios

A diferencia de `/alfred fix` (donde los filtros son opt-in), en hotfix son **obligatorios** cuando su disparador aplica. La urgencia no es excusa para saltar seguridad: un fix de 6 lineas en codigo con `[Authorize]` sin Sentinel es donde el costo de saltar el filtro es maximo.

## Tabla de disparadores obligatorios

| Filtro | Disparador obligatorio |
|---|---|
| **Sentinel** | El frente toca codigo con `[Authorize]`, modifica consulta a tabla sensible (logs, auditoria, permisos), modifica un permiso, o cambia politica de sesion/cookies. |
| **Quinn** | El frente modifica logica de validacion existente, agrega test nuevo, o fixea un bug que tenia test pasando (smell de cobertura). |
| **Cipher** | El frente toca una operacion criptografica (firma, verificacion, estampa, cifrado, hashing de credencial), cambia un algoritmo o sus parametros, toca el manejo de una llave/certificado/secreto, o el incidente lo causo material criptografico (certificado vencido, llave rotada, proveedor de estampa caido). Durante el incidente aplica P-C8: el material criptografico vivo (llaves y certificados de produccion) es de solo lectura de metadatos -- jamas se extrae, exporta ni ejercita. |

<!-- FUENTE de los principios P-C1..P-C8 (P-C8: produccion y material vivo intocables): agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". NO duplicar -- editar la fuente. -->

## Cuando el disparador aplica

1. Atlas anuncia en la bitacora del frente: `## HH:MM [atlas] Invito a {Sentinel|Quinn|Cipher}`.
2. El filtro entra con prefijo `I-{experto}:`, lee el frente, agrega su seccion en la bitacora del frente.
3. Si el filtro rechaza (hallazgo de severidad alta), Atlas itera la solucion. Cada iteracion se registra cronologicamente.
4. Cuando el filtro acepta, Atlas procede al cierre del frente.

## Cuando el disparador NO aplica

Atlas lo declara explicitamente en la bitacora del frente, con razon textual concreta. Ejemplo:

```
## HH:MM [atlas] Filtros opt-in

Sentinel: NO invocado. Razon: el cambio es ajuste de CSS sin tocar codigo backend
ni permisos.

Quinn: NO invocado. Razon: el cambio no modifica logica de validacion ni agrega test.

Cipher: NO invocado. Razon: el cambio no toca firma, llaves, cifrado ni credenciales.
```

La ausencia con razon explicita es parte de la disciplina: el rastro debe mostrar que se evaluo el disparador, no que se ignoro.
