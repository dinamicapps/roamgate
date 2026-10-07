# /alfred listar [filtros]

Comando de SOLO LECTURA del catálogo. NUNCA abre un README ni lee `_catalogo.yml` directamente para pintar la tabla — invoca el verbo runtime `catalog show`.

Invocaciones: `--estado X`, `--autor X`, `--modo X`, `--abandonados` (>30 días), `--archivo`, `--archivo --mes AAAA-MM`, `--todo`. Default: activos (EN_PROGRESO, PAUSADO, EN_PAUSA, PRE_CIERRE).

Pasos de gobierno:
1. Determinar fuente e invocar: `agentos catalog show` (default) | `agentos catalog show --archivo` (`--archivo`) | `agentos catalog show --todo` (`--todo`). El binario emite el catálogo fresco/auto-sanado (`CargarFresco`) — no requiere rebuild previo ni chequeo de drift aparte.
2. Parsear `{ok,data}`: si `ok:false`, mostrar `error.mensaje` y detenerse. Si `ok:true`, tomar las entries desde `data.works` (default/`--archivo`) o `data.activo` + `data.archivo` (`--todo`).
3. Aplicar filtros (`--estado` igualdad, `--autor` parcial case-insensitive, `--modo` igualdad, `--mes` sobre `cerrado_en` solo con `--archivo`, `--abandonados` >30 días).
4. Pintar tabla: Slug | Estado | Punto | Autor | Última actividad (relativa). Marcar `!` filas >30 días. `colaborador-fastrak` → Punto F0/F1/F2.
5. Menú de acción (AskUserQuestion) SOLO si: ≥1 activo Y NO `--archivo` Y `nivel` ≠ `maxima`. Opciones: continuar/pausar/ver detalle/nada. NO reimplementa pausar/continuar — delega a los subcomandos.

<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Catalogos de work-records". Schema del catalogo. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". Estados validos. NO duplicar -- editar la fuente. -->
