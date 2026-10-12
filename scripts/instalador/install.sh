#!/usr/bin/env bash
#
# install.sh - instala Roamgate (fork dinamicapps) en esta carpeta del dist (Git Bash).
#
# Este archivo es FUENTE: vive en `scripts/instalador/` del repo `dinamicapps/roamgate` y lo copia
# al espejo `scripts/publicar-dist.ts`. NO se edita en el espejo (ahi es un artefacto publicado,
# como el zip). Se corre DESDE el espejo, junto a `bin/`. Gemelo de `install.ps1`.
#
# Instalar y actualizar son UN SOLO camino: actualizar ES reinstalar. El .exe se extrae de
# `bin/roamgate-windows-x64.zip` a esta misma carpeta, junto a `roamgate.cmd`.
#
# Lo que este script NO hace, a proposito:
#   - NO verifica integridad de lo que extrae, y por eso no lo promete.
#   - NO detiene ni rearranca nada. Un .exe en ejecucion no se puede sobrescribir en Windows: si
#     roamgate.exe esta corriendo desde esta carpeta, avisa y no toca nada.
#   - NO instala Herdr: avisa si falta. Roamgate puede instalarlo con `roamgate herdr setup`.
#
set -euo pipefail

ARTEFACTO="roamgate"

echo ""
echo "  roamgate - instalador (dist dinamicapps)"
echo "  ----------------------------------------"

abortar() {
  echo "  [ABORT] $1" >&2
  shift
  for linea in "$@"; do echo "          $linea" >&2; done
  exit 1
}

ok() { printf '  [ok]    %s\n' "$1"; }

# --- 0. Este dist es Windows-only ----------------------------------------------------------------
#
# El zip trae roamgate.exe (windows-x64). En Linux/macOS instalaria un binario que no arranca.
ES_WINDOWS=0
case "${OSTYPE:-}" in
  msys* | cygwin* | win32*) ES_WINDOWS=1 ;;
esac
if [ "$ES_WINDOWS" -eq 0 ] && command -v uname > /dev/null 2>&1; then
  case "$(uname -s 2>/dev/null)" in
    MINGW* | MSYS* | CYGWIN* | Windows_NT) ES_WINDOWS=1 ;;
  esac
fi
if [ "$ES_WINDOWS" -eq 0 ]; then
  abortar "este dist es Windows-only: esta maquina no es Windows." \
    "" \
    "  El zip trae roamgate.exe (windows-x64). En otros sistemas usa los" \
    "  releases de upstream o construye desde el fuente." \
    "" \
    "  No se instalo nada. En Windows: usa PowerShell (.\\install.ps1) o Git Bash."
fi
ok "Windows"

DIST="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVO_VER="$DIST/VERSION-roamgate"
EXE="$DIST/roamgate.exe"
TEMPORAL="$DIST/.roamgate-extraccion"

# --- VERSION-roamgate: que se publico (contrato de scripts/publicar-dist.ts) --------------------

leer_campo() {
  # El `tr -d '\r'` es por si el archivo llego con CRLF (core.autocrlf de quien clono).
  grep -E "^$1=" "$ARCHIVO_VER" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\r'
}

# `roamgate.exe --version` imprime `roamgate <version>`. Imprime la version o nada.
version_del_exe() {
  [ -f "$1" ] || return 0
  "$1" --version 2>/dev/null | tr -d '\r' | sed -n 's/^roamgate \([^ ]*\) *$/\1/p' | head -1 || true
}

[ -f "$ARCHIVO_VER" ] || abortar "falta VERSION-roamgate en $DIST" \
  "" "estas en la carpeta del dist? hiciste 'git pull'?"

VER_NUEVA="$(leer_campo version)"
BUNDLE="$(leer_campo bundle)"
SHA="$(leer_campo sha)"
[ -n "$VER_NUEVA" ] && [ -n "$BUNDLE" ] || abortar "VERSION-roamgate no declara version y bundle: $ARCHIVO_VER" \
  "" "no parece publicado por scripts/publicar-dist.ts."
ZIP="$DIST/$BUNDLE"

[ -f "$ZIP" ] || abortar "no hay artefacto que instalar: falta $ZIP" "" "hiciste 'git pull'?"

# --- 1. Herdr: requisito para usarlo, no para instalarlo -----------------------------------------
#
# Roamgate es un cliente web de Herdr: sin Herdr arranca, pero no tiene sesiones que mostrar. No se
# aborta porque Roamgate mismo sabe instalarlo; se dice como.

if command -v herdr > /dev/null 2>&1; then
  ok "Herdr"
else
  echo "  [aviso] Herdr no esta en el PATH."
  echo "          Roamgate lo necesita para funcionar. Tras instalar puedes instalarlo con:"
  echo "            ./roamgate.exe herdr setup"
fi

# --- 1b. Contrasena de login: aviso, no abort ----------------------------------------------------
#
# Fuera de 127.0.0.1 (la IP de Tailscale) Roamgate exige login. Con ROAMGATE_PASSWORD definida debe
# tener 15..1024 caracteres (server/src/config/auth-token.ts); versiones viejas aceptaban menos y
# con una corta el nuevo no arranca. Sin la variable, Roamgate genera un token por su cuenta.

if [ -n "${ROAMGATE_PASSWORD:-}" ] && [ "${#ROAMGATE_PASSWORD}" -lt 15 ]; then
  echo "  [aviso] ROAMGATE_PASSWORD tiene ${#ROAMGATE_PASSWORD} caracteres; esta version exige 15 o mas."
  echo "          Con ella roamgate.cmd no arranca fuera de 127.0.0.1. Define una mas larga, p. ej.:"
  echo "            setx ROAMGATE_PASSWORD \"<15 o mas caracteres>\"   (agrega /M para toda la maquina)"
fi

# --- 2. Ya al dia: se informa y NO se toca nada --------------------------------------------------

VER_VIEJA="$(version_del_exe "$EXE")"

if [ -n "$VER_VIEJA" ] && [ "$VER_VIEJA" = "$VER_NUEVA" ]; then
  echo "  [=]     $ARTEFACTO  v$VER_NUEVA  (sha ${SHA:-?})  ya instalado"
  echo ""
  echo "  Ya estas al dia. No se toco nada."
  echo ""
  exit 0
fi

# --- 3. Lo vivo sigue vivo: un .exe en uso no se sobrescribe ------------------------------------
#
# Solo cuenta el roamgate.exe de ESTA carpeta, y se pregunta a Windows por la ruta del ejecutable
# (`ps` de Git Bash no ve los procesos nativos con su ruta). Sin PowerShell no hay inventario
# fiable: el `mv` de abajo falla solo y lo dice.

VIVOS=""
if command -v powershell.exe > /dev/null 2>&1 && command -v cygpath > /dev/null 2>&1; then
  EXE_WIN="$(cygpath -w "$EXE")"
  EXE_PS=${EXE_WIN//\'/\'\'} # comillas simples de PowerShell: la comilla se duplica
  VIVOS="$(powershell.exe -NoProfile -NonInteractive -Command \
    "@(Get-CimInstance Win32_Process -Filter \"Name = 'roamgate.exe'\" | Where-Object { \$_.ExecutablePath -ieq '$EXE_PS' } | ForEach-Object { \$_.ProcessId }) -join ', '" \
    2>/dev/null | tr -d '\r' || true)"
fi
if [ -n "$VIVOS" ]; then
  abortar "roamgate.exe esta en ejecucion desde esta carpeta (PID $VIVOS)." \
    "" \
    "  Windows no deja sobrescribir un .exe en uso. Cierralo (Ctrl+C en su" \
    "  consola, o cierra la ventana de roamgate.cmd) y vuelve a correr:" \
    "" \
    "    bash install.sh" \
    "" \
    "  No se detuvo ningun proceso y no se extrajo nada." \
    "  Sigue instalado: ${VER_VIEJA:+v}${VER_VIEJA:-(version desconocida)}"
fi

# --- 4. Extraer a un temporal y verificar ANTES de reemplazar -------------------------------------
#
# Se extrae aparte y se comprueba que el .exe nuevo diga la version publicada: un zip roto o
# equivocado no llega a pisar el roamgate.exe que funciona. `unzip` viene con Git for Windows; si no
# esta, se usa Expand-Archive de PowerShell.

rm -rf "$TEMPORAL"
mkdir -p "$TEMPORAL"
limpiar() { rm -rf "$TEMPORAL"; }
trap limpiar EXIT

if command -v unzip > /dev/null 2>&1; then
  unzip -o -q "$ZIP" -d "$TEMPORAL" || abortar "no se pudo descomprimir $ZIP"
elif command -v powershell.exe > /dev/null 2>&1 && command -v cygpath > /dev/null 2>&1; then
  powershell.exe -NoProfile -NonInteractive -Command \
    "\$ProgressPreference = 'SilentlyContinue'; Expand-Archive -LiteralPath '$(cygpath -w "$ZIP")' -DestinationPath '$(cygpath -w "$TEMPORAL")' -Force" \
    || abortar "no se pudo descomprimir $ZIP"
else
  abortar "no hay con que descomprimir: falta unzip y PowerShell." "" "usa .\\install.ps1 desde PowerShell."
fi

VER_EXTRAIDA="$(version_del_exe "$TEMPORAL/roamgate.exe")"
if [ "$VER_EXTRAIDA" != "$VER_NUEVA" ]; then
  abortar "el zip no trae la version que declara VERSION-roamgate." \
    "" \
    "  zip:      ${VER_EXTRAIDA:-(sin roamgate.exe valido)}" \
    "  VERSION:  $VER_NUEVA" \
    "" \
    "  No se toco roamgate.exe."
fi

mv -f "$TEMPORAL/roamgate.exe" "$EXE" || abortar "no se pudo reemplazar $EXE." \
  "" "  Si roamgate.exe esta abierto, cierralo y vuelve a correr: bash install.sh"

# --- 5. Verificar lo instalado ---------------------------------------------------------------------

VER_FINAL="$(version_del_exe "$EXE")"
[ "$VER_FINAL" = "$VER_NUEVA" ] || abortar "roamgate.exe instalado no reporta v$VER_NUEVA (reporta: ${VER_FINAL:-nada})." \
  "" "  $EXE"

if [ -n "$VER_VIEJA" ]; then
  echo "  [upd]   $ARTEFACTO  v$VER_VIEJA -> v$VER_NUEVA  (sha ${SHA:-?})"
else
  echo "  [inst]  $ARTEFACTO  v$VER_NUEVA  (sha ${SHA:-?})"
fi
echo "          -> $EXE"
ok "roamgate.exe --version: $VER_FINAL"

echo ""
echo "  Listo. Arranca con:"
echo ""
echo "    ./roamgate.cmd     (o roamgate.cmd desde cmd / PowerShell)"
echo ""
echo "  Escucha en la IP de Tailscale de esta maquina (o 127.0.0.1 sin Tailscale), puerto 8787."
echo "  Cambialos con las variables ROAMGATE_HOST y ROAMGATE_PORT."
echo ""
