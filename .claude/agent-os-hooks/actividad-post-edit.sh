#!/bin/bash
# Hook: appendear al carrete de archivos el hecho consumado de una edicion bajo
# agent-os/, emparejandolo con el bit de existencia que dejo el `pre`.
#
# El carrete es TONTO a proposito: una linea por edicion, sin agrupar y sin
# derivar el sujeto. Esta en el camino caliente de cada edicion, asi que tiene
# que costar lo minimo; agrupar las rafagas y derivar el sujeto es trabajo del
# verbo `agentos actividad archivos`, que corre en frio y a demanda.
#
# OBSERVADOR: sale 0 SIEMPRE y no escribe en stdout.
#
# Bash sin jq (no garantizado en Git Bash bajo Windows): grep + sed. La decision
# sobre la ruta vive en `normalizar_ruta`, compartida con el otro hook.

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

# normalizar_ruta: contrato completo en el brief de la tarea 7, seccion "El
# contrato de la normalizacion de rutas". Recibe el file_path crudo tal como
# sale del sed de arriba (JSON aun sin decodificar: un separador Windows real
# llega como PAR de backslash; un caracter de control llega como escape de 2
# bytes backslash+letra). Devuelve la ruta relativa a la raiz del repo bajo
# agent-os/, o vacio si hay que rechazarla.
#
# Copia EXACTA de la funcion del hook `pre` (Task 6): mismo cuerpo, para que
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
# printf y NO echo: el salto de linea que echo añade tampoco esta en el
# conjunto permitido, asi que `tr` lo convertiria en `_` y toda clave
# acabaria con un guion bajo de mas -- comprobado, `echo "P1-" | tr -c ...`
# rinde `P1-_`.
# Misma regla que en el `pre`: sin sesion no hay firma, y sin firma la linea
# no dice a que instancia pertenece.
[ -z "$SESSION_ID" ] && exit 0
CLAVE=$(printf '%s' "${SESSION_ID}-${AGENT_ID}" | tr -c 'A-Za-z0-9_-' '_')

DIR_ACT="agent-os/.actividad"
SCRATCH="$DIR_ACT/_pre/${CLAVE}.tmp"

# `?` es el valor por defecto, no un caso de error: se emite cuando el `pre` no
# corrio o cuando el emparejamiento fue ambiguo. Un dato ausente y declarado es
# mejor que uno plausible y falso.
#
# Que el default sea `nace` es el defecto exacto que esta linea existe para
# evitar: sin `pre` nadie SABE si el archivo existia, y afirmar que nacio inventa
# un hecho. Ademas dejaria `?` sin ningun productor -- un valor que el lector Go
# acepta y el schema documenta, que nunca se emitiria.
EVENTO="?"
if [ -f "$SCRATCH" ]; then
  LINEA_PRE=$(head -n1 "$SCRATCH" 2>/dev/null)
  EXISTIA="${LINEA_PRE%%	*}"
  RUTA_PRE="${LINEA_PRE#*	}"
  if [ "$RUTA_PRE" = "$REL" ]; then
    case "$EXISTIA" in
      no) EVENTO="nace" ;;
      si) EVENTO="cambia" ;;
    esac
    # Consumido: se borra para que no produzca un nace inventado la proxima vez.
    rm -f "$SCRATCH" 2>/dev/null
  fi
  # Si la ruta NO coincide, el scratch se queda: es de otra tool-call que aun no
  # llego a su post, y borrarlo le robaria su bit. De los strays se encarga la
  # purga con TTL corto.
fi

# Offset con dos puntos (-05:00), que es el formato que el lector Go espera.
# %z daria -0500 y el parser es estricto.
MOMENTO=$(date +"%Y-%m-%dT%H:%M:%S%:z" 2>/dev/null)
[ -z "$MOMENTO" ] && exit 0
DIA=$(date +"%Y-%m-%d")

mkdir -p "$DIR_ACT" 2>/dev/null || exit 0
printf '%s\t%s\t%s\t%s\t%s\n' "$MOMENTO" "$EVENTO" "$REL" "$SESSION_ID" "$AGENT_ID" \
  >> "$DIR_ACT/archivos-${DIA}.tsv" 2>/dev/null
exit 0
