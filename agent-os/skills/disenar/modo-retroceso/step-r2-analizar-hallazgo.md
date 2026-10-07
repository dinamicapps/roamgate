# step-r2: Analizar hallazgo

## Mision

Para el hallazgo activo (HZ-NNN), Mary lee:

- El archivo del hallazgo completo.
- El contrato del proceso afectado: `procesos/P{n}-*.md`.
- El codigo en evidencia anexa.
- Works relacionados via `work_origen`.

Cambia estado del hallazgo a `en_analisis`. Presenta diagnostico al usuario.

## Gate de impacto en diseño paraguas (solo si `es_paraguas: true`)

Si el diseño es paraguas, ANTES de proponer mitigación (step-r3) Mary inventaria el impacto
sobre lo ya construido. **Cuentan los works en estado terminal `COMPLETADO` y
`COMPLETADO_VERIFICACION_DIFERIDA`.**

Se EXCLUYEN explícitamente: `en_progreso`, `PAUSADO`, `COMPLETADO_CON_BRECHA` y cualquier
no-terminal:
- `en_progreso` cuyo proceso toca el hallazgo -> absorbe el cambio en su propio plan antes de
  cerrar (course correction normal, NO genera work de realineación).
- `PAUSADO` -> al retomarse ve el brief actualizado por path; no es código comprometido.
- `COMPLETADO_CON_BRECHA` -> declaró que no cumplió su meta al 100%; su código no es base
  confiable de desalineación.

`COMPLETADO_VERIFICACION_DIFERIDA` NO está en esa lista aunque su nombre suene a "incompleto":
su meta SÍ se cumplió entera — lo único pendiente es la ventana de comprobación, no el
entregable. Excluirlo repetiría el error que esa feature vino a corregir: tratar "no
verificado" como si fuera "incompleto".

**Inventario:** Mary lee `plan_works[]` del README, filtra los `estado: completado`, y por cada
uno cuyo proceso/contrato toca el hallazgo, invita a los expertos a validar la completitud
contra el cambio:
- **Dexter** si toca tablas/campos (qué datos quedan desalineados).
- **Cipher** si toca firma, estampas, llaves, cifrado o tokens criptograficos (que quedo con confianza degradada: firmas emitidas con el algoritmo viejo, tokens ya emitidos, material que hay que rotar). Si el hallazgo cae en una juntura (credenciales, tokens persistidos, interconexion firmada), el veredicto es conjunto con Dexter y/o Sentinel. <!-- FUENTE del protocolo de juntura: agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md seccion "Protocolo (4 reglas)". NO duplicar. -->
- **Sally/Paige** si toca páginas/UX.
- El anfitrión de ejecución si toca lógica.

Producen el inventario "qué quedó desalineado en los works terminales elegibles (COMPLETADO /
COMPLETADO_VERIFICACION_DIFERIDA)". Ese inventario alimenta la decisión de step-r3 (bifurcar vs
realinear).

<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". Qué cuenta como terminal/COMPLETADO vive alli. NO redefinir aqui — se filtra por los dos terminales COMPLETADO / COMPLETADO_VERIFICACION_DIFERIDA. -->

## Pasos

0. **Idempotencia (diff ya aplicado).** Si el hallazgo ya entra en estado `en_analisis` (reanudacion tras interrupcion entre step-r4 y step-r5), verificar si el diff ya se aplico: buscar marcas `<!-- HZ-{NNN} -->` en `brief.md`/`procesos/` y una entrada `## {fecha} — HZ-{NNN} mitigado` en `bitacora.md`. Si ambas existen, step-r4 ya corrio pero step-r5 no: **saltar directo a step-r5** (solo cerrar el hallazgo), sin re-aplicar el diff ni re-incrementar `brief_version`.

1. **Cambiar estado:**

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". El estado del hallazgo es maquina de estados — se transiciona con el verbo 'diseno hallazgo', NO se edita directamente con sed. NO duplicar la regla — para modificar, editar la fuente. -->

```bash
agentos diseno hallazgo --slug {slug} --id HZ-{NNN} --a en_analisis
```

2. **Calcular el impacto sobre el grafo.** La transicion del paso 1 emitio el nodo `hallazgo`
   al modelo (nace `abierto`, con su `invalida` y `origen: desde un work`). Con el nodo en el
   grafo, el alcance del cambio deja de deducirse leyendo prosa:

```bash
agentos modelo impacto --slug {slug} --nodo {id-del-nodo-invalidado} --desde brief
```

   Devuelve `etapas` (las que hay que re-recorrer si la mitigacion prospera) y `saltadas`
   (cada una con su razon). **`--desde brief`** porque en el retroceso el cambio llega desde
   fuera del diseño: hay que recorrer hasta el final, no hasta una etapa intermedia.

   Si el verbo sale `SIN_PROCEDENCIA`, el nodo invalidado viene de un modelo anterior a la
   procedencia: declararlo y preguntar de que etapa es, no adivinarlo.

3. **Mary publica diagnostico:**

```
A-Mary: HZ-{NNN}: {titulo}

Sintoma reportado: {sintoma textual del hallazgo}.

Lo que observo despues de leer:
- Nodo en duda: `{id}` ({tipo}, nacido en la etapa {etapa}).
- Contrato P{n}: {regla/articulo afectado}.
- Codigo en evidencia: {archivo:linea} muestra {patron observado}.
- Work origen ({work_slug}) hipotesis: {hipotesis textual}.

Alcance calculado: si mitigamos, hay que re-recorrer {etapas}. Quedan fuera
{saltadas} porque {razones}. El calculo llega a un salto — si al re-recorrer
aparece mas, se amplia.

Mi diagnostico: {diagnostico de Mary, 2-3 lineas}. {Si descarta hallazgo:
"este hallazgo NO requiere modificar el diseño porque {razon}; sugiero
cerrarlo como descartado y resolver dentro del work via /alfred reevaluar"}.

¿Procedo a proponer mitigacion, o discrepas con el diagnostico?
```

4. **Si usuario discrepa:** iterar. Si insiste en discrepancia y Mary tampoco
puede mitigar, cerrarlo con su razon — que el verbo exige cuando el estado destino
descarta el nodo del grafo:

```bash
agentos diseno hallazgo --slug {slug} --id HZ-{NNN} --a descartado \
  --razon "Mary no encontro mitigacion; pendiente de re-analisis con mas contexto"
```

5. **Si usuario aprueba diagnostico:** avanzar a step-r3.
