# Plantilla: entrada de reflexion verificada (reflexion-adn.md)

> Esquema canonico de UNA entrada de reflexion. Lo usan TODOS los agentes (expertos + Alfred) al cerrar un work. Vive en `_bmad/memory/{agente}-sidecar/devs/{dev}/reflexion-adn.md` del repo destino. Es un BUFFER drenable a ADN, NO memoria consultable. Sin `evidencia` anclada, la entrada se rechaza.

<!-- El deposito de una entrada se realiza con `agentos learn validar-candidato --experto {x} --slug {slug}` (entrada por stdin), que fuerza este schema (evidencia.ancla obligatoria) y appendea al buffer. El agente redacta; el binario valida y persiste. Este archivo es la fuente unica del schema; NO duplicar la regla. -->

Una entrada declara exactamente uno de `work:` o `diseno:` -- el primero cuando la leccion nace de cerrar un work, el segundo cuando nace de un regreso entre etapas de `/disenar`. El discriminador es cual campo esta presente, no un campo extra: las entradas escritas antes de que existiera `diseno:` traen `work:` y siguen siendo validas sin migracion. Lo inyecta el runtime (`--origen`), no el agente.

```yaml
- work: "{slug}"                      # work origen -- EXACTAMENTE UNO de work/diseno
# - diseno: "{slug}"                  # diseno origen (regreso entre etapas de /disenar)
  fecha: "{YYYY-MM-DD}"
  categoria: "{acierto-repetible | fallo-de-logica | correccion-de-usuario | error-en-sistema | artefacto-defectuoso}"
  arte: "{preguntar | diagnosticar | decidir | descomponer | verificar | comunicar}"
  observacion: "Que paso, en 1-2 lineas."
  disparador: "Condicion reconocible: CUANDO aplica esta leccion en trabajo futuro."
  evidencia:                          # OBLIGATORIO -- al menos un ancla, o la entrada se rechaza
    - tipo: "{work-record | correccion-usuario | error-sistema | codebase | artefacto-instructor}"
      ancla: "src/AgendaService.cs:38"   # una de las 5 formas -- ver "Regla de evidencia"
  leccion_candidata: "Imperativo: que deberia cambiar en mi forma de actuar."
  verificacion:                       # OBLIGATORIO -- como se comprueba que se aplico
    tipo: "{mecanica | outcome | humana}"
    detalle: "mecanica: {patron: regex, ambito: glob} | outcome: metrica/oficio que debe mover | humana: que confirma el operador"
  causa_atribuida: "Por que creo que paso. El curador la RE-DERIVA, no la toma como verdad."
```

## Las 5 categorias

1. `acierto-repetible` -- funciono y deberia volverse default. Se aprende tambien de aciertos.
2. `fallo-de-logica` -- el agente razono mal.
3. `correccion-de-usuario` -- el usuario corrigio Y la correccion se valido en el codebase (senal verificada de fallo real).
4. `error-en-sistema` -- codigo que el agente genero rompio algo real.
5. `artefacto-defectuoso` -- un skill/prompt/`.md` del sistema provoco/altero/condiciono la alucinacion o el dato sucio. El ancla es `archivo:linea` del artefacto instructor. La correccion es un Edit concreto -- pero SOLO se aplica en el repo origen (ver invariante de frontera).

## La dimension de oficio (arte) y las 4 propiedades

Un aprendizaje solo sirve si es una regla ejecutable, no una observacion. La entrada porta 3 de las 4 propiedades como campos — `disparador` (cuando aplica), `leccion_candidata` (imperativo) y `verificacion` tipada (como se comprueba) —; la 4a (no-contradiccion) NO es auto-declarable: la valida el gate de destilacion en la consolidacion. El campo `arte` clasifica QUE habilidad ejercita o fallo (enum global de 6) — es lo que permite a la consolidacion agregar incidentes dispersos en UN aprendizaje de oficio. `verificacion.tipo: mecanica` (con `{patron, ambito}`) habilita la alarma de reincidencia; `outcome` y `humana` son legitimas para aprendizajes de arte no greppeables.

Entradas anteriores a este schema (sin los 3 campos) siguen siendo drenables como `forma: legacy`; no alimentan la alarma de reincidencia.

## Regla de evidencia

Cada entrada DEBE tener al menos una `evidencia.ancla` verificable. Una reflexion sin ancla es auto-opinion y se rechaza en captura.

El ancla se valida por FORMA, no solo por presencia: una frase en prosa no es un lugar al que se pueda ir. Las **cinco** formas validas:

| Forma | Cuando | Ejemplo |
|---|---|---|
| `{ruta}:{linea}` | evidencia de codigo (`tipo: codebase`) o del artefacto instructor | `src/AgendaService.cs:38` |
| `{slug}/T-NNN` | una tarea concreta del work | `20260610-vc/T-001` |
| `{slug}/W-NN` | el work completo | `20260610-vc/W-01` |
| `standard/{ruta}` | un standard del repo | `standard/backend/naming.md` |
| `diseno/{slug}#{nodo}` | un nodo del modelo de un diseno (leccion nacida de un regreso entre etapas) | `diseno/20260730-reprogramar-cita#ENT_Cita` |

En `{ruta}:{linea}` la linea es obligatoria y numerica: sin ella el ancla no resuelve a un lugar. La ruta se escribe relativa al repo, con `/`.
