# Hotfix Fase 6: Cierre de frente y del hotfix

## Cierre de un frente

1. Atlas escribe la entrada de cierre en la bitacora del frente: **causa raiz declarada** (1-2 lineas honestas — si fue parche, decirlo), commit hash, verificacion ejecutada.
2. Cerrar cada frente via runtime: `agentos work file set-fm` (estado->`cerrado`, `causa_raiz`, `commit_cierre`) + `agentos work set-fm --slug <slug>` para mover `F{N}` de `frentes_abiertos` a `frentes_cerrados`. Ver `bmad-agent-alfred/gestion/hotfix.md`.
4. Registrar entrada en la maestra: `## HH:MM [atlas] Cierre F{N}`.
5. **Entry automatica obligatoria en `agent-os/post-works/_pendientes.md`** (recordatorio de causa raiz):
   ```markdown
   - [ ] **HOTFIX {slug-hotfix} F{N} ({fecha-cierre})** — {causa raiz declarada}.
     Revisar si {posible alcance mas amplio que el hotfix no agoto}. Hotfix solo
     arreglo {alcance especifico de este frente}.
   ```

## Cierre del hotfix

El hotfix cierra cuando TODOS los frentes estan cerrados (o el unico frente cuando no se abrieron F-N) Y el usuario aprueba.

1. Atlas registra entrada de cierre en la maestra: resumen del incidente, N frentes resueltos, M commits, convergencias detectadas, works pausados pendientes de retomar.
2. Cerrar el hotfix via runtime: `agentos work close --slug <slug> --estado COMPLETADO` — el binario rechaza si quedan frentes abiertos y archiva la carpeta completa; el catalogo no se escribe (se deriva en memoria en la siguiente lectura). La entry en `agent-os/post-works/_pendientes.md` se mantiene (trabajo cognitivo de Atlas). Ver `bmad-agent-alfred/gestion/hotfix.md`.
3. Anuncio al usuario:
   ```
   A-Atlas: Hotfix {slug-hotfix} cerrado como COMPLETADO.
   {N frentes resueltos, M commits, K convergencias detectadas.}

   Work pausado: {slug-work-pausado}. Para retomar:
     /alfred continuar {slug-work-pausado}
   ```
   (Omitir las dos lineas del work pausado si no habia ninguno.)

El cierre del hotfix es un momento de juicio real del operador: el anfitrion registra `agentos learn veredicto` (`origen: cierre-hotfix`) por el experto que condujo. Los hotfix NO alimentan metricas por experto (exclusion declarada del design de maduracion) pero SI veredictos.

## Invariantes (no se sacrifican)

Investigacion previa al fix, codebase como fuente con citas, busqueda de works relacionados, principios del MANIFIESTO por frente (P7 exento: un-break), filtros Sentinel/Quinn/Cipher obligatorios cuando aplica, entry en post-works por frente cerrado, honestidad sobre fix-de-raiz vs parche en `causa_raiz`.

<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work (campo `Estado` en README.md)". Estado COMPLETADO. NO duplicar -- editar la fuente. -->
