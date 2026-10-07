#!/bin/bash
# Hook: anotar, ANTES de una edicion, lo unico que despues ya no se puede saber:
# si el archivo existia.
#
# Despues del hecho, un Write sobre archivo nuevo y sobre archivo existente son
# identicos. Sin este bit no hay forma honesta de distinguir `nace` de `cambia`,
# y adivinar seria un dato plausible y falso.
#
# OBSERVADOR: sale 0 SIEMPRE y no escribe en stdout. Un exit 2 aqui bloquearia
# la edicion del usuario, y PreToolUse interpreta stdout.
#
# Hook APARTE de work-block-direct-edits.sh (no una linea dentro de el): ese
# hook tiene salidas tempranas -- exit 0 en el bypass de subagente, exit 2 en
# el guard del ledger -- y una anotacion puesta despues de esos puntos nunca
# correria para los subagentes, que son justo el caso que motiva este hook
# (varias instancias trabajando a la vez). El grupo Edit|Write de PreToolUse
# admite varios hooks.
#
# Bash sin jq (no esta garantizado en Git Bash bajo Windows): grep + sed.
#
# Lectura de stdin con timeout: `cat` se cuelga si el harness deja stdin abierto
# sin EOF (observado en Cygwin/Windows) y eso congela la interfaz.

INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null
[ -z "$INPUT" ] && exit 0

RUTA=$(echo "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
[ -z "$RUTA" ] && exit 0

# _norm_drive: unifica las dos formas de prefijo absoluto que puede traer
# `pwd` o una ruta ya colapsada a forward-slash, a una forma canonica
# "/x/resto" en minuscula:
# (los dos ejemplos de abajo son FORMAS de prefijo, no rutas de una maquina
#  concreta: sin mostrarlas no se entiende que normaliza esta funcion)
# lint:allow C1
#   - drive letter de Windows:  "E:/resto"          -> "/e/resto"
# lint:allow C1 -- idem
#   - Cygwin:                   "/cygdrive/E/resto" -> "/e/resto"
# lint:allow C1 -- idem
# Sin esto la comparacion contra pwd depende de que bash ejecuta el hook (el
# lint:allow C1 -- idem
# MSYS de Git-Bash da pwd="/e/..."; un bash Cygwin da pwd="/cygdrive/e/...").
# Las dos formas deben comparar igual porque no se sabe cual corre en produccion.
_norm_drive() {
  local p="$1"
  case "$p" in
    /cygdrive/[A-Za-z]/*|/cygdrive/[A-Za-z])
      local resto="${p#/cygdrive/}"
      local letra="${resto:0:1}"
      letra=$(printf '%s' "$letra" | tr 'A-Z' 'a-z')
      p="/${letra}${resto:1}"
      ;;
    [A-Za-z]:/*|[A-Za-z]:)
      local letra="${p:0:1}"
      letra=$(printf '%s' "$letra" | tr 'A-Z' 'a-z')
      p="/${letra}${p:2}"
      ;;
  esac
  printf '%s' "$p"
}

# normalizar_ruta: contrato completo en el brief de esta tarea, seccion "El
# contrato de la normalizacion de rutas". Recibe el file_path crudo tal como
# sale del sed de arriba (JSON aun sin decodificar: un separador Windows real
# llega como PAR de backslash; un caracter de control llega como escape de 2
# bytes backslash+letra). Devuelve la ruta relativa a la raiz del repo bajo
# agent-os/, o vacio si hay que rechazarla.
#
# Compartida en su forma con el hook `post` (Task 7): mismo cuerpo, para que
# el emparejamiento por ruta nunca falle porque un lado normalizo distinto.
normalizar_ruta() {
  local entrada="$1"
  local bs
  bs=$'\\'  # exactamente 1 byte (0x5c), via comillas ANSI-C: sin ambiguedad.

  # 0) Bytes de control LITERALES (payload no estricto) -- independiente de
  #    cualquier backslash, se decide primero.
  case "$entrada" in
    *$'\t'*|*$'\r'*|*$'\n'*) return 1 ;;
  esac

  # 1) Colapsar el PAR de backslash que JSON usa para escapar un separador
  #    Windows real (\\ en el JSON = un backslash literal = un separador).
  #    Medido ejecutando: este sed por si solo NO toca un backslash suelto
  #    (un `\t` de un solo byte de barra queda intacto); solo colapsa PARES.
  #    La trampa del hook bloqueador existente es la COMBINACION de este sed
  #    con un `tr` posterior de limpieza de sueltos -- aqui no hay ese `tr`,
  #    asi que colapsar antes de revisar escapes es seguro.
  local ruta
  ruta=$(printf '%s' "$entrada" | sed 's/\\\\/\//g')

  # 2) Escapes JSON de caracteres de control: backslash + letra (2 bytes),
  #    verificados SOBRE LO YA COLAPSADO, no sobre la entrada cruda. Medido
  #    ejecutando: revisarlo ANTES de colapsar da falso positivo cuando un
  #    separador real termina justo donde el segmento siguiente empieza con
  #    t/r/n por coincidencia del nombre (ej. una ruta real con un segmento
  #    "normalizar..." tras un separador generaba la subcadena backslash+n
  #    sin ser ningun escape de control).
  case "$ruta" in
    *"${bs}t"*|*"${bs}r"*|*"${bs}n"*) return 1 ;;
  esac

  # 3) Prefijo ./ es la misma ruta.
  case "$ruta" in
    ./*) ruta="${ruta#./}" ;;
  esac

  # 4) Ruta absoluta: solo se acepta si cae bajo la raiz del repo actual (el
  #    hook corre con el cwd en la raiz del proyecto). No basta con que
  #    contenga /agent-os/: medido ejecutando, eso aceptaba el agent-os/ de
  #    OTRO repo y lo metia en el carrete de este.
  case "$ruta" in
    /*|[A-Za-z]:/*)
      local cwd_norm ruta_norm rel
      cwd_norm=$(_norm_drive "$(pwd)")
      ruta_norm=$(_norm_drive "$ruta")
      case "$ruta_norm" in
        "$cwd_norm"/*) rel="${ruta_norm#"$cwd_norm"/}" ;;
        *) return 1 ;;
      esac
      ruta="$rel"
      ;;
  esac

  # 5) Debe caer bajo agent-os/ con algo despues (el borde agent-os-dinamicapps
  #    exige la barra a los dos lados; "agent-os" o "agent-os/" a secas no son
  #    un archivo editado).
  case "$ruta" in
    agent-os/?*) : ;;
    *) return 1 ;;
  esac

  # 6) Ningun segmento puede ser . ni .. -- medido ejecutando: un ".." en medio
  #    apunta a un directorio distinto del que la derivacion del sujeto leeria,
  #    y atribuiria la edicion al lugar equivocado. Resolver el .. seria otra
  #    opcion; rechazar es mas barato y no puede equivocarse.
  local IFS=/
  local seg
  for seg in $ruta; do
    case "$seg" in
      .|..) return 1 ;;
    esac
  done

  printf '%s' "$ruta"
  return 0
}

REL=$(normalizar_ruta "$RUTA")
[ -z "$REL" ] && exit 0

SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
AGENT_ID=$(echo "$INPUT" | sed -n 's/.*"agent_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)

# La clave NO puede ser solo la sesion: los subagentes la comparten y este
# sistema los despacha en paralelo. Con agent_id vacio para el principal, cada
# agente tiene la suya. Aun asi puede colisionar (un agente puede emitir dos
# Edit en un bloque), y por eso el scratch guarda la ruta: el `post` lo rechaza
# si no coincide y emite `?` en vez de inventar.
#
# Solo camino 2 ({session_id}-{agent_id}): el Step 1 de esta tarea busco un
# identificador de tool-call (tool_use_id/toolUseId/tool_call_id) en todo el
# repo -- hooks, runtime, docs -- y el UNICO resultado fue la mencion del propio
# comando de busqueda en el plan; ningun payload real capturado ni ningun hook
# existente usa esa clave. Implementar un camino 1 contra un campo que nunca se
# vio seria codigo muerto que aparenta cobertura.
#
# printf y NO echo: el salto de linea que echo añade tampoco esta en el
# conjunto permitido, asi que `tr` lo convertiria en `_` y toda clave acabaria
# con un guion bajo de mas -- comprobado, `echo "P1-" | tr -c ...` rinde `P1-_`.
# Sin sesion no hay firma, y una linea sin firma no responde "quien esta
# tocando esto", que es la pregunta entera del feed. Se sale ANTES de calcular
# la clave: con SESSION_ID vacio la clave seria "-" o "-atlas", que no
# coincide con el centinela y colaria un scratch anonimo.
[ -z "$SESSION_ID" ] && exit 0
CLAVE=$(printf '%s' "${SESSION_ID}-${AGENT_ID}" | tr -c 'A-Za-z0-9_-' '_')

DIR_PRE="agent-os/.actividad/_pre"
mkdir -p "$DIR_PRE" 2>/dev/null || exit 0

EXISTIA="no"
# Contra la RELATIVA: el hook corre con el cwd en la raiz del proyecto, igual
# que el bloqueador que ya existe.
[ -e "$REL" ] && EXISTIA="si"

printf '%s\t%s\n' "$EXISTIA" "$REL" > "$DIR_PRE/${CLAVE}.tmp" 2>/dev/null
exit 0
