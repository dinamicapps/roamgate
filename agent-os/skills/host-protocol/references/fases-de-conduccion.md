# Fases de conduccion de una etapa

> Detalle consultable de como un anfitrion conduce las 5 fases de su etapa (saludo, deteccion de senales, invitacion cross-experto, mantener hilo, cierre) y de como se sincroniza el campo `rol` en la transicion entre anfitriones. Movido desde `host-protocol/SKILL.md` (CG-01/05/06) — el nucleo siempre-activo queda alli; esto es material de referencia.

## Las 5 fases

### Fase 1: Saludo y contexto inicial

Al activarse como anfitrion de una etapa, el experto:

1. Lee el work-record activo (`agent-os/work-records/{slug}/README.md` + `etapa-N/bitacora.md` de etapas previas si las hay).
2. Lee los datos de su etapa desde `etapas/etapa-N.md` (roster de invitables, senales a detectar, criterio de cierre, artefacto integrador esperado).
3. **Re-afirma el rol en el archivo de sesion.** Escribe en `agent-os/work-records/_sesiones/{session_id}.yml` los campos `rol: anfitrion` y `anfitrion: {nombre-del-experto}`, y refresca `actualizado`. El gobernador ya escribio esto al activarte (ver "Sincronizacion del rol en la transicion de etapa" abajo) — este paso es una **red de seguridad idempotente**: si el archivo ya esta correcto, no cambia nada; si por alguna razon quedo en `rol: gobernador`, lo corrige. El hook `work-block-direct-edits.sh` decide por este campo si la sesion puede editar codigo. Esquema del archivo de sesion en `agent-os/templates/work-record/schema/catalogos-y-sesion.md` seccion "Control de edicion por sesion".
4. Saluda al usuario con su voz en 2-3 lineas: etapa que arranca, objetivo, invitados disponibles.
5. Propone primer paso concreto o pregunta orientadora.

El saludo lleva prefijo `A-{nombre-anfitrion}:`. Ejemplo: `A-Mary: Etapa 1 Discovery iniciada. Tengo disponibles a Winston (arq), Sentinel (seg), Paige (docs), Quinn (testing). ¿De que trata el negocio que vamos a modelar?`

### Fase 2: Deteccion de senales

Durante la conversacion, el anfitrion monitorea las senales declaradas en su `etapas/etapa-N.md`. Las senales son datos, no protocolo — cada etapa define las suyas.

Cuando una senal aparece en el dialogo con el usuario, el anfitrion decide si invitar al experto correspondiente. **Regla critica:** invitar solo cuando la senal es inequivoca, no preventivamente. "Por si acaso" vuelve al anfitrion verboso y reintroduce el overhead que este refactor elimina.

### Fase 3: Invitacion cross-experto

Cuando el anfitrion decide invitar a otro experto:

1. Anuncia con prefijo: `A-Mary: Detecto senal de seguridad. Invito a Sentinel.`
2. En el mismo turno o siguiente, el invitado responde con prefijo: `I-Sentinel: ...`
3. El invitado trae contexto leyendo lo reciente de la conversacion + el work-record. No requiere re-briefing del anfitrion para casos obvios.
4. El anfitrion sigue conduciendo el hilo. El invitado aporta puntualmente y se mantiene disponible para mas intervenciones.
5. Cuando el invitado termina su aporte puntual, el anfitrion retoma el hilo.

**Regla critica:** el invitado no toma el control completo. Habla cuando es llamado o cuando detecta una senal critica de su dominio. No conduce el dialogo.

**Invitacion ligera, no ritual "On Activation":** el ritual "On Activation" que cada experto trae en su propio SKILL.md (saludo formal, menu de capacidades) aplica SOLO cuando el experto se invoca standalone (fuera del flujo gobernado). Dentro del flujo rige esta Fase 3, la invitacion ligera: cargar SKILL + voz del experto, sin menu ni saludo formal — el anfitrion ya gobierna el momento y el ritual completo duplicaria el gobierno. La invitacion ligera **conserva** las cargas de dominio del experto (ej. memoria sidecar y standards custodiados de Dexter, de los que depende P-D1) — solo se omiten el saludo y el menu.

### Fase 4: Mantener hilo y trazabilidad

Mientras la conversacion avanza:

- El anfitrion es responsable de que la bitacora de etapa (`etapa-N/bitacora.md`) refleje las decisiones clave. Puede escribirlas el mismo, pedirle a un invitado (ej. Paige documenta mientras Mary conduce), o dejar que work consolide al cierre.
- Cada bloque de mensaje lleva prefijo (ver "Sistema de prefijos").
- Referencias cruzadas a CAs, tareas, work-record paths son estandar.

### Fase 5: Cierre de etapa

Cuando el anfitrion considera que la etapa cumplio su criterio de cierre:

1. Propone al usuario: `A-Mary: Creo que el discovery esta completo. N CAs consolidados. ¿Avanzamos a Etapa 2?`
2. Si el usuario aprueba, el anfitrion genera el artefacto integrador (CAs consolidados para E1, plan para E2, reporte ejecucion para E3, reporte verificacion para E4). Puede invitar a otros expertos para co-producir.
3. Una vez generado el artefacto, publica: `A-Mary: Etapa 1 cerrada. Entregando al gobernador.`
4. El gobernador toma el hilo: `S-sistema: Gate Etapa 1 aprobado. Iniciando Etapa 2.` y activa al anfitrion de la etapa siguiente.
5. **El gobernador escribe el rol del anfitrion entrante** (ver "Sincronizacion del rol en la transicion de etapa" abajo). En el mismo paso en que activa al siguiente anfitrion, el gobernador escribe en `agent-os/work-records/_sesiones/{session_id}.yml` `rol: anfitrion` y `anfitrion: {nombre del anfitrion de la etapa entrante}` (refresca `actualizado`). NO se deja en `rol: gobernador` esperando que la Fase 1 del anfitrion lo corrija.
6. Al cerrar una etapa y avanzar a la siguiente: el gobernador escribe la etapa nueva en el frontmatter del README del work — no existe catalogo fisico que actualizar. Esquema en `agent-os/templates/work-record/schema/catalogos-y-sesion.md` seccion "Catalogos de work-records". La proxima vez que algo pide el catalogo (`agentos catalog show`), la reconstruccion en memoria lee ese README y reporta `punto_actual` y `ultima_actividad` al dia, sin que la transicion de etapa haya escrito ningun catalogo.

**Regla critica:** solo el gobernador ejecuta la transicion entre etapas. El anfitrion pide el cierre; el gobernador lo concede.

### Sincronizacion del rol en la transicion de etapa

> **FUENTE DE VERDAD de cuando se escribe el rol.** El comando gobernador (Alfred via `piezas/`; o `/work` legacy) referencia esta seccion. El esquema del archivo de sesion vive en `agent-os/templates/work-record/schema/catalogos-y-sesion.md` seccion "Control de edicion por sesion".

El campo `rol` del archivo de sesion determina si la sesion puede editar codigo (ver "Alcance de edicion durante un work activo" en `host-protocol/SKILL.md`). Para que el hook `work-block-direct-edits.sh` decida bien, `rol` debe reflejar el rol real del agente **en todo momento**.

**Quien escribe `rol`, y cuando:**

- **El gobernador, al activar a un anfitrion** (cierre de gate, `/alfred continuar`, `/alfred regresar`, activacion del primer anfitrion tras el abordaje): escribe `rol: anfitrion` + `anfitrion: {nombre}` en el MISMO paso en que activa al anfitrion. Este es el punto de control primario y obligatorio — no es omitible.
- **El anfitrion, en su Fase 1** (paso "Marca el rol en el archivo de sesion"): re-afirma `rol: anfitrion` + `anfitrion: {su nombre}`. Es una **red de seguridad** (idempotente: si el gobernador ya lo escribio, no cambia nada), no el mecanismo primario.
- **El gobernador, al volver a gobernar** (`/alfred pausar`, `/alfred cancelar`, cierre del work): escribe `rol: gobernador` o libera a `null` segun el caso.

## Anti-patron del despacho como workaround

**Anti-patron:** dejar `rol: gobernador` tras activar a un anfitrion "porque la Fase 1 lo corregira". Si la Fase 1 se omite, el anfitrion queda bloqueado para editar codigo y — sintoma observado — termina despachando a un subagente como workaround innecesario. La escritura en la transicion (work) hace el sistema robusto ante la omision de la Fase 1.

**Lo que este anti-patron condena — y lo que NO.** Condena el despacho **como tapadera de una activacion rota**: el anfitrion no puede escribir, y en vez de corregir su rol, delega. La cura es activarlo bien, no delegar.

NO condena el **despacho orquestado como diseno**, que es una capacidad de primera clase del sistema: el anfitrion, correctamente activado, despacha expertos como subagentes para ganar independencia epistemica (un revisor que no vio el razonamiento del autor) y ventana limpia (doctrina que no compite con el contexto acumulado).

**Como distinguirlos en una linea:** si el anfitrion despacha porque **no puede** hacerlo el mismo, es el anti-patron. Si despacha porque **otro lo hace mejor o mas limpio**, es el diseno.
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Las dos clases". La doctrina completa de despacho (las dos clases, contrato del ejecutor, orquestacion, gate por nivel) vive alli. Aqui solo se distingue el despacho legitimo del workaround. NO duplicar la regla — para modificar, editar la fuente. -->
