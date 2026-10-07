# Autoridad epistemologica en brownfield

> Principio y mecanica: en brownfield el codebase es fuente de verdad sobre como funciona/se conecta lo existente; el usuario es fuente de verdad sobre que quiere. Detalle consultable — esta es la fuente canonica. Movido desde `host-protocol/SKILL.md` (CG-01/05/06).

## Autoridad epistemologica en brownfield

**Principio rector:** *cuando el diseño o el work toca codigo existente, el codebase es la fuente de verdad primaria sobre como funciona y como se conecta. El usuario es fuente de verdad sobre **que quiere** que pase, no sobre **como esta hecho** lo que ya existe.*

**Esta distincion se aplica desde la primera conversacion con el usuario, no como filtro tardio.** Las etapas/steps posteriores confirman lo aterrizado en la primera, no descubren contradicciones que debieron resolverse antes.

### Por que este principio existe

El usuario describe de memoria. Aunque haya escrito o liderado el sistema original, los detalles operacionales (firmas exactas, contratos implicitos, dependencias inyectadas, query filters globales, middleware, actores que resuelven contexto) drift en su memoria con el tiempo. El modelador (Mary, Atlas, cualquier experto) tiende a tomar la descripcion como verdad por tres razones — todas trampas:

1. **La conversacion fluye mejor.** Validar implica abrir el repo, hacer grep, leer — friccion inmediata vs. fluidez perceptible.
2. **Validar produce friccion social.** Contradecir al usuario sobre "como funciona TU sistema" se siente irrespetuoso.
3. **El intent del usuario aparece como autoritativo.** Y lo es — pero solo sobre **que quiere**, no sobre **como esta hecho lo existente**.

La fluidez sin validacion produce intents/briefs que el codigo contradice silenciosamente. Las contradicciones emergen tarde (E3/E4 del work consumidor) con costo de reevaluacion alto.

**Caso real:** diseño `ihce_gateway/agent-os/disenos/20260430-backoffice-eri`. El usuario describio que el operador BackOffice-ERI opera sobre `EmpresaService`, `ConfiguracionIhceService` y `ITenantContext` (services y context reusables del repo). Esa descripcion fue absorbida al brief sin validar contra codigo. El codigo asumia `ITenantContext.TenantResuelto = true` para todos sus consumidores — invariante implicito que el operador BackOffice-ERI viola por construccion (no es tenant). El work consumidor descubrio el invariante-puente en E3 T-030 tras 27 tareas done, forzando reevaluacion E3->E1 y archivado de etapa-1-v1/etapa-2-v1/etapa-3-v1.

### Distincion: que es autoridad del usuario vs autoridad del codigo

| Tipo de afirmacion | Autoridad |
|---|---|
| **Que quiere lograr** (intent, meta, alcance) | Usuario |
| **Que reglas de negocio aplica el dominio** | Usuario |
| **Prioridades, decisiones, tradeoffs aceptables** | Usuario |
| **Como funciona el codigo existente** (firmas, contratos, dependencias, middleware) | Codigo |
| **Como se conecta lo nuevo con lo existente** | Codigo (validado contra el repo huesped y reusables) |
| **Que invariantes implicitos asumen los services/contextos reusables** | Codigo |
| **Que actores resuelven que contexto en el sistema actual** | Codigo |

El principio NO es "duda de todo lo que diga el usuario". Es: distingue entre **que quiere** (autoridad del usuario) y **como esta hecho lo que existe** (autoridad del codigo). En brownfield, ambos viven en el mismo turno de conversacion y hay que separarlos en tiempo real.

### Como se aplica: validacion inline en la primera conversacion

Cuando el usuario hace un **claim sobre como funciona codigo existente** (durante step-01 de `/disenar`, paso 0 de `/alfred iniciar --desde-diseno`, conversacion de `/alfred fix` (alias legacy; ruta: `bugfix`), o cualquier otro contexto brownfield), el experto:

1. **Detecta el claim.** Patrones tipicos: "esto se conecta con [sistema/modulo]", "hereda auth de [middleware/handler]", "consume el service [IXxxService]", "reusa la tabla / contrato / endpoint [X]", "el actor [usuario/operador] resuelve sesion / permisos / contexto asi", "en el sistema gemelo [eMedicoMVC/DinamicERP] esto funciona asi".

2. **NO transcribe el claim al artefacto sin validar.** Anota internamente como hipotesis pendiente, no como hecho del intent/brief.

3. **Valida inline antes de cerrar la conversacion actual.** No al final del diseño. No en steps posteriores. Aqui mismo. Friccion de 5-15 minutos por claim.

4. **Tres caminos posibles tras validar:**

   - **Codebase confirma:** registrar la cita real (`archivo:linea`) en el artefacto, eliminar el "segun el usuario". El artefacto queda apoyado en evidencia desde su nacimiento.
   - **Codebase contradice:** declararselo al usuario antes de seguir. **No reescribir el artefacto para complacer al usuario. No reescribir el codigo para complacer al artefacto.** Exponer la divergencia y dejar que el usuario decida:
     - "Tienes razon, mi memoria estaba mal — usemos lo que dice el codigo." → artefacto apoyado en codigo.
     - "El codigo tiene un bug que nadie ha tocado — vamos a corregirlo." → ese es un cambio al codigo, **explicitamente autorizado**, no implicito por reescritura del brief.
     - "Quiero que en el futuro funcione como dije — vamos a refactor X primero." → eso es un work nuevo o sub-objetivo del work actual, **explicitamente declarado**.
   - **Validacion ambigua o parcial:** registrar como hipotesis abierta explicitamente marcada "pendiente validacion con codebase". El siguiente step la consume primero.

5. **Cierra la conversacion con artefacto ya validado.** Las etapas/steps posteriores confirman, no descubren.

### Conexion con step-01 de /disenar y paso 0 de /alfred iniciar --desde-diseno

Esta es la **mecanica operativa** del principio. Sin validacion en step-01, el principio se vuelve filosofia. Sin validacion en paso 0 de `--desde-diseno`, el work consumidor parte sobre arena.

- En `/disenar` step-01 (el FOCO), ver seccion "Mocion 2 — Definicion del punto de partida" del archivo `agent-os/skills/disenar/modo-inicial/step-01-foco.md`: los claims del usuario no son un paso aparte, cada uno nace como nodo del modelo, y el que afirma algo del mundo preexistente no cierra sin cita. En diseños del regimen `lineal`, el equivalente es la seccion "Validacion inline de claims sobre codigo existente" de `agent-os/skills/disenar/lineal/step-01-intencion.md`.
- En `/alfred iniciar --desde-diseno` paso 0, el experto que activa lee esta misma seccion al detectar claims residuales del brief que no fueron validados en step-01.

### Anti-patrones explicitos

- **Escribir el intent/brief reflejando la descripcion del usuario sin validar contra codigo.** Camino facil que produce drifts emergentes en E3/E4. Anti-patron principal.
- **Modificar codigo del repo "para que cuadre con lo que el usuario dijo" sin autorizacion explicita.** El modelo NO debe reescribir el codebase para complacer una descripcion imprecisa. Cualquier cambio al codigo existente es decision del usuario, declarada como tarea, no consecuencia silenciosa.
- **Asumir que "el usuario lo escribio, debe saberlo".** El usuario lidera el sistema, si. Pero la memoria sobre detalles operacionales drift. Validar no es desconfiar del usuario; es respetar la complejidad del sistema.
- **Saltar la validacion porque "el usuario tiene prisa" o "ya casi cerramos step-01".** La friccion de validar (5-15 min por claim) ahorra horas de reevaluacion downstream.
- **Posponer la validacion a steps posteriores con la idea de "ya lo profundizamos despues".** Todo lo que viene despues modela sobre arena si step-01 cerro con claims no validados. El costo de validar tarde es alto: el contexto ya esta cargado, el usuario agotado, y reescribir significa repropuesta de decisiones que ya parecian firmes.

### Relacion con TR-10 Data flow back-trace

TR-10 es el **barrido sistematico** sobre datos criticos / actores / dependencias reusables. La resolucion de los claims del usuario es el **filtro temprano** sobre lo que el usuario afirmo puntualmente. Los dos viven en el mismo step-01 (el FOCO) y se corren en ese orden:

- Los claims se resuelven en la mocion 2, en el momento en que se hacen: el codigo puede
  **confirmar** la afirmacion (el nodo cierra con su cita si es de los tipos que citan; si no,
  la cita vive en el nodo vecino que si afirma lo existente), **contradecirla** (el nodo se
  resuelve con lo que dice el codigo y la divergencia nace como nodo `decision`), o dejarla
  **ambigua** (nodo `pregunta`).
- TR-10 corre como bloqueante antes de cerrar, sobre el catalogo completo de actores/reusables del modelo, detectando invariantes-puente que el usuario no menciono explicitamente como claim.

Con los claims resueltos primero, TR-10 trabaja sobre input ya validado y solo detecta lo residual. Sin eso, TR-10 carga con todo el costo de la validacion tardia. En el regimen `lineal`, el filtro temprano vive en step-01 y TR-10 en el cierre de step-02.
