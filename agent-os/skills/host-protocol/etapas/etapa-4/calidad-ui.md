# Etapa 4 — Rubrica de calidad de UI (CU-1..CU-5)

> Tarjeta por-chequeo de Etapa 4, hermana de EV-N (evidencia), CS-N (seguridad)
> y CD-N (datos). FUENTE canonica de la rubrica CU. Se carga cuando alguna tarea
> del work declara `evidencia_requerida.ui: true`. La ruta `rediseno-ui` la
> ejerce con umbral mas estricto, conductor propio (Quinn conduce el navegador)
> y destino propio del resultado (la fila del hito) — ver su fase 3; aqui vive
> la regla.

## Por que existe

La verificacion funcional prueba que el CA funciona; nadie probaba que la
pantalla este BIEN: dropdowns muertos que "pasan" porque el CA no los toca,
grids desalineados, vistas sin estado vacio, CSS que solo carga en el harness.
El unico sensor era el ojo del usuario en el gate — todo lo que ese ojo no
atrapaba se difería como brecha. La rubrica CU es el ojo autonomo: pre-filtra
con criterios objetivos ANTES del gate humano.

## La rubrica CU

| Chequeo | Que verifica | Bloqueante |
|---------|--------------|------------|
| **CU-1 Funcionalidad de controles** | Cada control interactivo del alcance se ejercita en navegador: dropdowns abren y cargan items desde su origen declarado; formularios envian y reciben; cada boton/accion visible tiene handler real (un control inerte "por fidelidad" se declara y se registra, no se descubre). | Si |
| **CU-2 Estados** | La vista exhibe sus estados cargando / vacio / error / exito segun el patron declarado (o el default del standard del repo). Estado ausente sin declaracion = hallazgo. | Si |
| **CU-3 Adherencia al sistema visual del repo** | Inspeccion de DOM/CSS contra el standard frontend declarado en `agent-os/standards/frontend/` (en eMedico: tokens `nv-*`, BEM, sin CSS inline no declarado, sin clases fuera del catalogo, nomenclatura del catalogo). Si el repo NO tiene standard frontend: CU-3 degrada a los chequeos universales (CU-1/2/4/5) y dispara señal DT (destilar standard) como hallazgo. | Si (con standard) |
| **CU-4 Composicion perceptual** | Alineacion, espaciado y jerarquia medidos sobre el DOM real: grids rotos, elementos desbordados o solapados, ritmos asimetricos (hijos pegados a 0px), jerarquia tipografica invertida. | Si |
| **CU-5 Wiring real** | Los chequeos CU corren sobre la VISTA DE PRODUCCION (la pagina real bajo su layout real), no solo en harness/galeria/storybook. Un componente que pasa en galeria puede estar roto en produccion (CSS no enlazado en el layout). | Si |

## Roles y produccion

<!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md seccion "Principio de roles (no negociable)". Quinn coordina, el experto produce, Alfred/Claude no ejecutan. Aqui solo el reparto especifico de CU. NO duplicar la regla — para modificar, editar la fuente. -->

| Rol | Quien | Que hace |
|-----|-------|----------|
| Productora | Tessa (invitada por Quinn, en Fase 2) | Conduce el navegador: ejercita CU-1 y CU-2, mide CU-4 sobre el DOM, garantiza CU-5 (corre en la vista real). Captura evidencia y escribe el resultado por chequeo. |
| Veredicto | Sally (invitada condicional, capacidad `VU`) | Emite el veredicto de CU-3 (adherencia al standard) y el juicio perceptual de CU-4 sobre lo capturado por Tessa. No conduce el navegador; juzga. Si CU-3 degrada por falta de standard, Sally decide si el hallazgo DT se eleva. |
| Auditora | Quinn | Recolecta los resultados escritos, verifica completitud de la rubrica y los integra al criterio de cierre. No produce ni emite veredictos de dominio. |

## Resultado escrito (obligatorio)

Cada chequeo CU deja un resultado TEXTUAL por pantalla del alcance, en
`etapa-4/evidencia/ui/_indice.md` seccion "Calidad UI (CU)":

```
### {pantalla}
- CU-1: {PASS | FAIL {detalle}} — evidencia: {captura(s) / accion ejercitada}
- CU-2: {PASS | FAIL {estado faltante}} — evidencia: {captura por estado}
- CU-3: {PASS | FAIL {violacion + cita al standard} | DEGRADADO (sin standard, señal DT emitida)} — veredicto: Sally
- CU-4: {PASS | FAIL {medicion: que esta roto y donde}} — veredicto: Sally sobre captura/DOM
- CU-5: {PASS (vista real: {url/layout}) | FAIL (solo harness)}
```

PNGs sin este texto NO cuentan como rubrica ejecutada (la captura prueba; el
texto es lo auditable). Un FAIL bloqueante se resuelve en el work o se registra
como brecha aceptada por el usuario (mismo contrato que EV-N: descarte en
`evidencia_requerida.descartes[]` + `[OVERRIDE]` en bitacora).

## Disparador y enforcement

- Aplica cuando alguna tarea del work declara `evidencia_requerida.ui: true`
  (campo existente; no hay perilla nueva).
- La profundidad la gradua Quinn segun el alcance del work (un ajuste de un
  boton no exige medir toda la pantalla): la rubrica define el MINIMO
  verificable sobre la superficie tocada, no un maximo.
- Enforcement (desde SP5): `agentos work checklist-cierre` emite `CU-1`..`CU-5`
  cuando `evidencia_requerida.ui` esta activa, y `work close` bloquea con
  `CU_SIN_RESULTADO` (sin resultado escrito en `_indice.md` seccion "Calidad UI
  (CU)") y `VERIFICADOR_FALTANTE` (tarea de UI cerrada sin verificador). La
  exencion es el descarte del eje `ui` con razon en
  `evidencia_requerida.descartes[]` + `[OVERRIDE]` en bitacora.

## Relacion con el gate visual humano

El gate del usuario (INV-PROC-06 en la ruta rediseno-ui; gate de aprobacion en
works normales) NO se sustituye ni se debilita: CU es el pre-filtro autonomo.
El work llega al gate con la rubrica pasada y escrita; el ojo humano juzga lo
que solo un humano puede ("esto ES el sistema visual", jerarquia estetica),
no caza dropdowns rotos. Un gate humano aprobado NO exime un FAIL de CU sin
descarte registrado.
