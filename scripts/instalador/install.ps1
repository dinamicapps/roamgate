#Requires -Version 5.1
#
# install.ps1 - instala Roamgate (fork dinamicapps) en esta carpeta del dist (variante Windows).
#
# Este archivo es FUENTE: vive en `scripts/instalador/` del repo `dinamicapps/roamgate` y lo copia
# al espejo `scripts/publicar-dist.ts`. NO se edita en el espejo (ahi es un artefacto publicado,
# como el zip). Se corre DESDE el espejo, junto a `bin/`. Gemelo de `install.sh`.
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
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'   # sin esto Expand-Archive en 5.1 tarda varias veces mas

$Artefacto = 'roamgate'

Write-Host ""
Write-Host "  roamgate - instalador (dist dinamicapps)"
Write-Host "  ----------------------------------------"

function Abortar {
    param([string]$Mensaje, [string[]]$Detalle = @())
    Write-Host "  [ABORT] $Mensaje" -ForegroundColor Red
    foreach ($l in $Detalle) { Write-Host "          $l" }
    exit 1
}

function Ok {
    param([string]$Texto)
    Write-Host "  [ok]    $Texto" -ForegroundColor Green
}

# --- 0. Este dist es Windows-only ----------------------------------------------------------------
#
# En PowerShell 5.1 es cierto por construccion, pero el chequeo queda EXPLICITO: PowerShell 7 corre
# en Linux y macOS, y alli este .exe no arranca. La condicion la declara el instalador.
$EsWindows = $true
if (Get-Variable -Name IsWindows -ErrorAction SilentlyContinue) {
    $EsWindows = $IsWindows   # PowerShell 6+ (multiplataforma)
}
if (-not $EsWindows) {
    Abortar "este dist es Windows-only: esta maquina no es Windows." @(
        "",
        "  El zip trae roamgate.exe (windows-x64). En otros sistemas usa los",
        "  releases de upstream o construye desde el fuente.",
        "",
        "  No se instalo nada."
    )
}
Ok "Windows"

$Dist       = $PSScriptRoot
$ArchivoVer = Join-Path $Dist 'VERSION-roamgate'
$Exe        = Join-Path $Dist 'roamgate.exe'
$Temporal   = Join-Path $Dist '.roamgate-extraccion'

# --- VERSION-roamgate: que se publico (contrato de scripts/publicar-dist.ts) --------------------

function Leer-VersionDist {
    param([string]$Ruta)
    $datos = @{}
    foreach ($linea in Get-Content -LiteralPath $Ruta) {
        $i = $linea.IndexOf('=')
        if ($i -gt 0) { $datos[$linea.Substring(0, $i).Trim()] = $linea.Substring($i + 1).Trim() }
    }
    return $datos
}

# `roamgate.exe --version` imprime `roamgate <version>`. Devuelve la version o $null.
function Version-DelExe {
    param([string]$Ruta)
    if (-not (Test-Path -LiteralPath $Ruta -PathType Leaf)) { return $null }
    # En 5.1, con 'Stop', cualquier linea en stderr de un exe nativo se vuelve excepcion.
    $ErrorActionPreference = 'Continue'
    try {
        $salida = (& $Ruta --version 2>&1 | Out-String).Trim()
    } catch {
        return $null
    }
    $m = [regex]::Match($salida, '(?m)^roamgate (\S+)\s*$')
    if (-not $m.Success) { return $null }
    return $m.Groups[1].Value
}

if (-not (Test-Path -LiteralPath $ArchivoVer -PathType Leaf)) {
    Abortar "falta VERSION-roamgate en $Dist" @("", "estas en la carpeta del dist? hiciste 'git pull'?")
}
$Publicado = Leer-VersionDist $ArchivoVer
if (-not $Publicado.ContainsKey('version') -or -not $Publicado.ContainsKey('bundle')) {
    Abortar "VERSION-roamgate no declara version y bundle: $ArchivoVer" @(
        "", "no parece publicado por scripts/publicar-dist.ts."
    )
}
$VerNueva = $Publicado['version']
$Zip      = Join-Path $Dist ($Publicado['bundle'] -replace '/', '\')
$Sha      = if ($Publicado.ContainsKey('sha')) { $Publicado['sha'] } else { '?' }

if (-not (Test-Path -LiteralPath $Zip -PathType Leaf)) {
    Abortar "no hay artefacto que instalar: falta $Zip" @("", "hiciste 'git pull'?")
}

# --- 1. Herdr: requisito para usarlo, no para instalarlo -----------------------------------------
#
# Roamgate es un cliente web de Herdr: sin Herdr arranca, pero no tiene sesiones que mostrar. No se
# aborta porque Roamgate mismo sabe instalarlo; se dice como.

if (Get-Command herdr -ErrorAction SilentlyContinue) {
    Ok "Herdr"
} else {
    Write-Host "  [aviso] Herdr no esta en el PATH." -ForegroundColor Yellow
    Write-Host "          Roamgate lo necesita para funcionar. Tras instalar puedes instalarlo con:"
    Write-Host "            .\roamgate.exe herdr setup"
}

# --- 2. Ya al dia: se informa y NO se toca nada --------------------------------------------------

$VerVieja = Version-DelExe $Exe

if ($null -ne $VerVieja -and $VerVieja -eq $VerNueva) {
    Write-Host "  [=]     $Artefacto  v$VerNueva  (sha $Sha)  ya instalado"
    Write-Host ""
    Write-Host "  Ya estas al dia. No se toco nada."
    Write-Host ""
    exit 0
}

# --- 3. Lo vivo sigue vivo: un .exe en uso no se sobrescribe ------------------------------------
#
# Solo cuenta el roamgate.exe de ESTA carpeta: otro Roamgate (otra version, otra carpeta) puede
# seguir corriendo, no se toca ni estorba. Se aborta antes de extraer nada: no se detiene ningun
# proceso, se dice cual cerrar.

$Vivos = @()
try {
    $Vivos = @(Get-CimInstance Win32_Process -Filter "Name = 'roamgate.exe'" -ErrorAction Stop |
        Where-Object { $null -ne $_.ExecutablePath -and $_.ExecutablePath -ieq $Exe })
} catch {
    $Vivos = @()   # sin inventario fiable, el reemplazo de abajo falla solo y lo dice
}
if ($Vivos.Count -gt 0) {
    $pids = ($Vivos | ForEach-Object { $_.ProcessId }) -join ', '
    Abortar "roamgate.exe esta en ejecucion desde esta carpeta (PID $pids)." @(
        "",
        "  Windows no deja sobrescribir un .exe en uso. Cierralo (Ctrl+C en su",
        "  consola, o cierra la ventana de roamgate.cmd) y vuelve a correr:",
        "",
        "    .\install.ps1",
        "",
        "  No se detuvo ningun proceso y no se extrajo nada.",
        "  Sigue instalado: $(if ($null -eq $VerVieja) { '(version desconocida)' } else { "v$VerVieja" })"
    )
}

# --- 4. Extraer a un temporal y verificar ANTES de reemplazar -------------------------------------
#
# Se extrae aparte y se comprueba que el .exe nuevo diga la version publicada: un zip roto o
# equivocado no llega a pisar el roamgate.exe que funciona.

if (Test-Path -LiteralPath $Temporal) { Remove-Item -LiteralPath $Temporal -Recurse -Force }
try {
    Expand-Archive -LiteralPath $Zip -DestinationPath $Temporal -Force
    $ExeNuevo = Join-Path $Temporal 'roamgate.exe'
    $VerExtraida = Version-DelExe $ExeNuevo
    if ($VerExtraida -ne $VerNueva) {
        Remove-Item -LiteralPath $Temporal -Recurse -Force
        Abortar "el zip no trae la version que declara VERSION-roamgate." @(
            "",
            "  zip:      $(if ($null -eq $VerExtraida) { '(sin roamgate.exe valido)' } else { $VerExtraida })",
            "  VERSION:  $VerNueva",
            "",
            "  No se toco roamgate.exe."
        )
    }
    Move-Item -LiteralPath $ExeNuevo -Destination $Exe -Force
} catch {
    if (Test-Path -LiteralPath $Temporal) { Remove-Item -LiteralPath $Temporal -Recurse -Force -ErrorAction SilentlyContinue }
    Abortar "no se pudo extraer roamgate.exe." @(
        "",
        "  $($_.Exception.Message)",
        "",
        "  Si roamgate.exe esta abierto, cierralo y vuelve a correr .\install.ps1"
    )
}
Remove-Item -LiteralPath $Temporal -Recurse -Force

# --- 5. Verificar lo instalado ---------------------------------------------------------------------

$VerFinal = Version-DelExe $Exe
if ($VerFinal -ne $VerNueva) {
    Abortar "roamgate.exe instalado no reporta v$VerNueva (reporta: $VerFinal)." @("", "  $Exe")
}

if ($null -ne $VerVieja) {
    Write-Host "  [upd]   $Artefacto  v$VerVieja -> v$VerNueva  (sha $Sha)"
} else {
    Write-Host "  [inst]  $Artefacto  v$VerNueva  (sha $Sha)"
}
Write-Host "          -> $Exe"
Ok "roamgate.exe --version: $VerFinal"

Write-Host ""
Write-Host "  Listo. Arranca con:" -ForegroundColor Green
Write-Host ""
Write-Host "    .\roamgate.cmd"
Write-Host ""
Write-Host "  Escucha en la IP de Tailscale de esta maquina (o 127.0.0.1 sin Tailscale), puerto 8787."
Write-Host "  Cambialos con las variables ROAMGATE_HOST y ROAMGATE_PORT."
Write-Host ""
