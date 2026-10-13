#Requires -Version 5.1
#
# install.ps1 - instala Roamgate (fork dinamicapps) en esta carpeta del dist (variante Windows).
#
# Este archivo es FUENTE: vive en `scripts/instalador/` del repo `dinamicapps/roamgate` y lo copia
# al espejo `scripts/publicar-dist.ts`. NO se edita en el espejo (ahi es un artefacto publicado,
# como el zip). Se corre DESDE el espejo, junto a `bin/`. Gemelo de `install.sh`.
#
# Instalar y actualizar son UN SOLO camino: actualizar ES reinstalar. Todo en uno:
#   1. Herdr: si no esta, lo instala desde el canal oficial (https://herdr.dev/install.ps1).
#   2. roamgate.exe: lo extrae de `bin/roamgate-windows-x64.zip` a esta carpeta.
#   3. Configuracion: fija HOST, PORT y la contrasena en %APPDATA%\roamgate\roamgate.env.
#   4. Arranque automatico: Herdr y Roamgate quedan como tareas programadas del usuario, sin
#      ventana, que arrancan al iniciar sesion (`roamgate herdr setup` y `roamgate service install`).
#
# Parametros:
#   -Puerto <n>     puerto de Roamgate (por defecto: el de roamgate.env, o 8787)
#   -Ip <ip>        IP donde escucha (por defecto: la de roamgate.env, o la de Tailscale, o 127.0.0.1)
#   -Password <pw>  contrasena de login, 15..1024 caracteres (por defecto: la de roamgate.env, o
#                   $env:ROAMGATE_PASSWORD si es valida, o una generada que se muestra al final)
#   -SinServicio    solo extrae roamgate.exe, como antes: no instala Herdr ni toca tareas; se
#                   arranca a mano con roamgate.cmd
#
# Lo que este script NO hace, a proposito:
#   - NO verifica integridad del zip: comprueba que el .exe extraido diga la version publicada.
#   - NO detiene un roamgate.exe que se lanzo a mano: solo detiene el de su propia tarea.
#   - NO reinicia un Herdr que ya corre: cerraria tus terminales.
#
param(
    [int]$Puerto = 0,
    [string]$Ip = '',
    [string]$Password = '',
    [switch]$SinServicio
)
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

function Aviso {
    param([string]$Texto, [string[]]$Detalle = @())
    Write-Host "  [aviso] $Texto" -ForegroundColor Yellow
    foreach ($l in $Detalle) { Write-Host "          $l" }
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
$DirConfig  = Join-Path $env:APPDATA 'roamgate'
$ArchivoEnv = Join-Path $DirConfig 'roamgate.env'

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

# Corre roamgate.exe con sus argumentos mostrando su salida; devuelve el codigo de salida.
function Ejecutar-Roamgate {
    param([string[]]$Argumentos)
    $ErrorActionPreference = 'Continue'
    & $Exe @Argumentos | ForEach-Object { Write-Host "          $_" }
    return $LASTEXITCODE
}

# Nombre de la tarea programada que crea `roamgate service install` (o `herdr setup` con el
# prefijo de Herdr): sha256 de %APPDATA%\roamgate en minusculas, 16 hex. Mismo calculo que
# server/src/config/service-definitions.ts (resolveServicePaths).
function Nombre-Tarea {
    param([string]$Prefijo)
    $base  = $DirConfig.ToLowerInvariant()
    $bytes = [Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($base))
    $hex   = -join ($bytes[0..7] | ForEach-Object { $_.ToString('x2') })
    return "$Prefijo-$hex"
}

function Tarea-Existe {
    param([string]$Nombre)
    return $null -ne (Get-ScheduledTask -TaskName $Nombre -ErrorAction SilentlyContinue)
}

function Procesos-DeEsteExe {
    try {
        return @(Get-CimInstance Win32_Process -Filter "Name = 'roamgate.exe'" -ErrorAction Stop |
            Where-Object { $null -ne $_.ExecutablePath -and $_.ExecutablePath -ieq $Exe })
    } catch {
        return @()   # sin inventario fiable, el reemplazo de abajo falla solo y lo dice
    }
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

$TareaRoamgate = Nombre-Tarea 'dev.roamgate'

# Los parametros se validan antes de instalar nada.
function Contrasena-Valida {
    param([string]$Valor)
    return ($Valor -and $Valor.Length -ge 15 -and $Valor.Length -le 1024 -and $Valor -notmatch '[\r\n]')
}
if ($Password -and -not (Contrasena-Valida $Password)) {
    Abortar "-Password debe tener entre 15 y 1024 caracteres (tiene $($Password.Length))." @("", "  No se instalo nada.")
}
if ($Puerto -lt 0 -or $Puerto -gt 65535) {
    Abortar "-Puerto debe estar entre 1 y 65535 (es $Puerto)." @("", "  No se instalo nada.")
}

# --- 1. Herdr: se instala desde el canal oficial si falta ----------------------------------------
#
# Roamgate es un cliente web de Herdr: sin Herdr no tiene sesiones que mostrar. Se busca donde lo
# buscaria el propio Roamgate (server/src/herdr/bootstrap.ts findHerdrBinary): el PATH y el
# directorio gestionado %APPDATA%\roamgate\herdr. Arrancarlo es del paso 6 (`herdr setup`).

function Buscar-Herdr {
    $cmd = Get-Command herdr -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $gestionado = Get-ChildItem -Path (Join-Path $DirConfig 'herdr\*\herdr.exe') -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($gestionado) { return $gestionado.FullName }
    return $null
}

# El instalador oficial agrega Herdr al PATH del usuario en el registro; esta sesion no lo ve
# hasta releerlo.
function Refrescar-Path {
    $maquina = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $usuario = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = (@($maquina, $usuario) | Where-Object { $_ }) -join ';'
}

$Herdr = Buscar-Herdr
if ($Herdr) {
    Ok "Herdr: $Herdr"
} elseif ($SinServicio) {
    Aviso "Herdr no esta instalado." @(
        "Roamgate lo necesita para funcionar. Instalalo con .\install.ps1 (sin -SinServicio)",
        "o con: .\roamgate.exe herdr setup"
    )
} else {
    Write-Host "  [..]    Herdr no esta instalado: instalando desde https://herdr.dev ..."
    $script = Join-Path $env:TEMP ("herdr-install-" + [guid]::NewGuid().ToString('N') + ".ps1")
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri 'https://herdr.dev/install.ps1' -OutFile $script -UseBasicParsing
    } catch {
        Abortar "no se pudo descargar el instalador de Herdr." @(
            "", "  $($_.Exception.Message)", "",
            "  Instalalo a mano desde https://herdr.dev y vuelve a correr .\install.ps1"
        )
    }
    $ErrorActionPreference = 'Continue'
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script | ForEach-Object { Write-Host "          $_" }
    $codigo = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    Remove-Item -LiteralPath $script -Force -ErrorAction SilentlyContinue
    Refrescar-Path
    $Herdr = Buscar-Herdr
    if ($codigo -ne 0 -or -not $Herdr) {
        Abortar "la instalacion de Herdr fallo (codigo $codigo)." @(
            "", "  Instalalo a mano desde https://herdr.dev y vuelve a correr .\install.ps1"
        )
    }
    Ok "Herdr instalado: $Herdr"
}

# --- 2. Contrasena de login ----------------------------------------------------------------------
#
# Fuera de 127.0.0.1 Roamgate exige login. Una contrasena fija debe tener 15..1024 caracteres
# (server/src/config/auth-token.ts). Con -SinServicio solo se avisa, como antes: roamgate.cmd la
# toma de $env:ROAMGATE_PASSWORD.


if ($SinServicio) {
    $Pw = $env:ROAMGATE_PASSWORD
    if ($Pw -and $Pw.Length -lt 15) {
        Aviso "ROAMGATE_PASSWORD tiene $($Pw.Length) caracteres; esta version exige 15 o mas." @(
            "Con ella roamgate.cmd no arranca fuera de 127.0.0.1. Define una mas larga, p. ej.:",
            "  setx ROAMGATE_PASSWORD ""<15 o mas caracteres>""   (agrega /M para toda la maquina)"
        )
    }
}

# --- 3. Ya al dia: no se extrae, pero se sigue con la configuracion -------------------------------

$VerVieja = Version-DelExe $Exe
$AlDia    = ($null -ne $VerVieja -and $VerVieja -eq $VerNueva)

if ($AlDia) {
    Write-Host "  [=]     $Artefacto  v$VerNueva  (sha $Sha)  ya instalado"
} else {
    # --- 4. Lo vivo: un .exe en uso no se sobrescribe ------------------------------------------
    #
    # Solo cuenta el roamgate.exe de ESTA carpeta: otro Roamgate (otra version, otra carpeta)
    # puede seguir corriendo. Si lo lanzo su tarea programada se detiene (el paso 6 la vuelve a
    # arrancar); si se lanzo a mano, se aborta sin tocarlo.
    $Vivos = @(Procesos-DeEsteExe)
    if ($Vivos.Count -gt 0 -and -not $SinServicio -and (Tarea-Existe $TareaRoamgate)) {
        Write-Host "  [..]    deteniendo la tarea $TareaRoamgate para actualizar ..."
        $ErrorActionPreference = 'Continue'
        & schtasks.exe /End /TN $TareaRoamgate 2>&1 | Out-Null
        $ErrorActionPreference = 'Stop'
        # La tarea corre roamgate.exe dentro de `conhost --headless`: /End termina conhost pero no
        # a su hijo. El de la tarea se reconoce por `service run` (roamgate.cmd usa --host/--port).
        foreach ($p in @(Procesos-DeEsteExe)) {
            if ($p.CommandLine -match '\sservice\s+run\s') { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }
        }
        $limite = (Get-Date).AddSeconds(15)
        while (@(Procesos-DeEsteExe).Count -gt 0 -and (Get-Date) -lt $limite) { Start-Sleep -Milliseconds 250 }
        $Vivos = @(Procesos-DeEsteExe)
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

    # --- 5. Extraer a un temporal y verificar ANTES de reemplazar -------------------------------
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
}

# --- Modo manual: hasta aqui llegaba el instalador antes ------------------------------------------

if ($SinServicio) {
    if (Tarea-Existe $TareaRoamgate) {
        Aviso "existe la tarea $TareaRoamgate (arranque automatico); -SinServicio no la toco." @(
            "Para quitarla: .\roamgate.exe service uninstall"
        )
    }
    Write-Host ""
    Write-Host "  Listo. Arranca con:" -ForegroundColor Green
    Write-Host ""
    Write-Host "    .\roamgate.cmd"
    Write-Host ""
    Write-Host "  Escucha en la IP de Tailscale de esta maquina (o 127.0.0.1 sin Tailscale), puerto 8787."
    Write-Host "  Cambialos con las variables ROAMGATE_HOST y ROAMGATE_PORT."
    Write-Host ""
    exit 0
}

# --- 6. Configuracion: %APPDATA%\roamgate\roamgate.env ------------------------------------------
#
# Es el archivo que lee la tarea de Roamgate (`roamgate service run <env>`). `service install` lo
# preserva; aqui solo se fijan HOST, PORT, ROAMGATE_PASSWORD y ROAMGATE_DISABLE_UPDATE_CHECK (el
# updater interno apunta a los releases de upstream). El resto de lineas no se toca.

# Misma plantilla que DEFAULT_SERVICE_ENV_FILE (server/src/config/service-definitions.ts).
$PlantillaEnv = @'
# roamgate service environment
# This file is preserved by `roamgate service install`.
HOST=0.0.0.0
PORT=8787

# Optional fixed password (15..1024 characters). Otherwise a token is generated.
# ROAMGATE_PASSWORD=replace-with-a-strong-password

# Optional native HTTPS. Set both to absolute PEM file paths.
# ROAMGATE_TLS_CERT=/path/to/cert-chain.pem
# ROAMGATE_TLS_KEY=/path/to/private-key.pem

# Operational logs default to info. Use debug only while diagnosing an issue.
# ROAMGATE_LOG_LEVEL=info

# Optional Herdr connection settings.
# HERDR_SOCKET_PATH=/path/to/herdr.sock
# HERDR_CLIENT_SOCKET_PATH=/path/to/herdr-client.sock
# HERDR_SSH_HOST=user@example.com
'@

function Leer-ValorEnv {
    param([string[]]$Lineas, [string]$Nombre)
    $valor = $null
    foreach ($l in $Lineas) {
        $m = [regex]::Match($l, "^\s*(?:export\s+)?$Nombre\s*=\s*(.*?)\s*$")
        if (-not $m.Success) { continue }
        $v = $m.Groups[1].Value
        if ($v.Length -ge 2 -and ($v[0] -eq '"' -or $v[0] -eq "'") -and $v[-1] -eq $v[0]) { $v = $v.Substring(1, $v.Length - 2) }
        $valor = $v
    }
    return $valor
}

function Fijar-ValorEnv {
    param([System.Collections.Generic.List[string]]$Lineas, [string]$Nombre, [string]$Valor)
    $patron = "^\s*(?:export\s+)?$Nombre\s*="
    $hecho = $false
    for ($i = 0; $i -lt $Lineas.Count; $i++) {
        if ($Lineas[$i] -match $patron) {
            if (-not $hecho) { $Lineas[$i] = "$Nombre=$Valor"; $hecho = $true }
            else { $Lineas.RemoveAt($i); $i-- }
        }
    }
    if (-not $hecho) { $Lineas.Add("$Nombre=$Valor") }
}

function Ip-Tailscale {
    if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) { return $null }
    $ErrorActionPreference = 'Continue'
    $salida = & tailscale ip -4 2>$null
    if ($LASTEXITCODE -ne 0) { return $null }
    return ($salida | Where-Object { $_ -match '^\d+\.\d+\.\d+\.\d+$' } | Select-Object -First 1)
}

function Generar-Contrasena {
    $alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    $rng = New-Object Security.Cryptography.RNGCryptoServiceProvider
    $bytes = New-Object byte[] 20
    $rng.GetBytes($bytes)
    return -join ($bytes | ForEach-Object { $alfabeto[$_ % $alfabeto.Length] })
}

$EnvExistia = Test-Path -LiteralPath $ArchivoEnv -PathType Leaf
$TextoEnv   = if ($EnvExistia) { [IO.File]::ReadAllText($ArchivoEnv) } else { $PlantillaEnv }
$Lineas     = New-Object 'System.Collections.Generic.List[string]'
foreach ($l in ($TextoEnv -split '\r?\n')) { $Lineas.Add($l) }
while ($Lineas.Count -gt 0 -and $Lineas[$Lineas.Count - 1] -eq '') { $Lineas.RemoveAt($Lineas.Count - 1) }

# IP: -Ip, la del .env existente, la de Tailscale, 127.0.0.1.
$IpEnv = if ($EnvExistia) { Leer-ValorEnv $Lineas 'HOST' } else { $null }
$IpDestino = if ($Ip) { $Ip } elseif ($IpEnv) { $IpEnv } else { Ip-Tailscale }
if (-not $IpDestino) { $IpDestino = '127.0.0.1' }

# Puerto: -Puerto, el del .env existente, 8787.
$PuertoEnv = if ($EnvExistia) { Leer-ValorEnv $Lineas 'PORT' } else { $null }
$PuertoDestino = if ($Puerto -gt 0) { $Puerto } elseif ($PuertoEnv -match '^\d+$') { [int]$PuertoEnv } else { 8787 }
if ($PuertoDestino -lt 1 -or $PuertoDestino -gt 65535) {
    Abortar "puerto invalido: $PuertoDestino" @("", "  Usa -Puerto entre 1 y 65535.")
}

# Contrasena: -Password, la del .env si es valida, $env:ROAMGATE_PASSWORD si es valida, generada.
$PwEnv = Leer-ValorEnv $Lineas 'ROAMGATE_PASSWORD'
$PwGenerada = $false
if ($Password) {
    $PwDestino = $Password
} elseif (Contrasena-Valida $PwEnv) {
    $PwDestino = $PwEnv
} elseif (Contrasena-Valida $env:ROAMGATE_PASSWORD) {
    $PwDestino = $env:ROAMGATE_PASSWORD
} else {
    $PwDestino = Generar-Contrasena
    $PwGenerada = $true
}

Fijar-ValorEnv $Lineas 'HOST' $IpDestino
Fijar-ValorEnv $Lineas 'PORT' ([string]$PuertoDestino)
Fijar-ValorEnv $Lineas 'ROAMGATE_PASSWORD' $PwDestino
Fijar-ValorEnv $Lineas 'ROAMGATE_DISABLE_UPDATE_CHECK' '1'

New-Item -ItemType Directory -Force -Path $DirConfig | Out-Null
[IO.File]::WriteAllText($ArchivoEnv, (($Lineas -join "`n") + "`n"), (New-Object Text.UTF8Encoding $false))
Ok "configuracion: $ArchivoEnv  (HOST=$IpDestino, PORT=$PuertoDestino)"
# Se anuncia aqui y no solo al final: si un paso posterior aborta, la siguiente corrida la toma
# del .env como existente y ya no la mostraria.
if ($PwGenerada) {
    Write-Host "          contrasena generada: $PwDestino  (anotala; queda en roamgate.env)" -ForegroundColor Cyan
}

# --- 7. Arranque automatico: Herdr y Roamgate como tareas del usuario ----------------------------
#
# `herdr setup` registra la tarea de Herdr y lo arranca si no corre; si ya corre sin tarea, solo la
# registra (no lo reinicia). `service install` registra la tarea de Roamgate y la (re)arranca.

# Desde una terminal de Herdr este proceso hereda del pane HERDR_SOCKET_PATH y
# HERDR_CLIENT_SOCKET_PATH con las rutas por defecto, y `herdr setup` rechaza toda ruta explicita
# (server/src/herdr/bootstrap.ts assertManagedSetupAllowed). Solo se quitan si son las de defecto:
# una ruta personalizada de verdad se respeta y `herdr setup` explica que hacer.
$DirHerdr = Join-Path $env:APPDATA 'herdr'
foreach ($par in @(@('HERDR_SOCKET_PATH', 'herdr.sock'), @('HERDR_CLIENT_SOCKET_PATH', 'herdr-client.sock'))) {
    $valor = [Environment]::GetEnvironmentVariable($par[0], 'Process')
    if ($valor -and $valor -ieq (Join-Path $DirHerdr $par[1])) {
        [Environment]::SetEnvironmentVariable($par[0], $null, 'Process')
    }
}

Write-Host "  [..]    Herdr: .\roamgate.exe herdr setup"
$codigo = Ejecutar-Roamgate @('herdr', 'setup')
if ($codigo -ne 0) {
    Abortar "roamgate herdr setup fallo (codigo $codigo)." @(
        "", "  roamgate.exe quedo instalado; revisa el mensaje de arriba y vuelve a correr .\install.ps1"
    )
}

Write-Host "  [..]    Roamgate: .\roamgate.exe service install"
$codigo = Ejecutar-Roamgate @('service', 'install')
if ($codigo -ne 0) {
    Abortar "roamgate service install fallo (codigo $codigo)." @(
        "",
        "  Si dice que la tarea ya existe y no la genero Roamgate, revisala con",
        "    Get-ScheduledTask $TareaRoamgate",
        "  y reemplazala con: .\roamgate.exe service install --force"
    )
}

# --- 8. Verificar que escucha ------------------------------------------------------------------

$Escucha = $false
$limite = (Get-Date).AddSeconds(20)
while (-not $Escucha -and (Get-Date) -lt $limite) {
    $cliente = New-Object Net.Sockets.TcpClient
    try {
        $intento = $cliente.BeginConnect($IpDestino, $PuertoDestino, $null, $null)
        if ($intento.AsyncWaitHandle.WaitOne(1000) -and $cliente.Connected) { $Escucha = $true }
    } catch {
    } finally {
        $cliente.Close()
    }
    if (-not $Escucha) { Start-Sleep -Milliseconds 500 }
}
if (-not $Escucha) {
    Abortar "Roamgate no responde en ${IpDestino}:$PuertoDestino tras 20 s." @(
        "",
        "  Estado:   .\roamgate.exe service status",
        "  Tarea:    Get-ScheduledTaskInfo $TareaRoamgate   (LastTaskResult)",
        "  Prueba a mano (se ve el error): .\roamgate.exe service run ""$ArchivoEnv"""
    )
}
Ok "Roamgate escucha en ${IpDestino}:$PuertoDestino"

Write-Host ""
Write-Host "  Listo. Roamgate y Herdr arrancan solos al iniciar sesion." -ForegroundColor Green
Write-Host ""
Write-Host "    Abre:        http://${IpDestino}:$PuertoDestino"
if ($PwGenerada) {
    Write-Host "    Contrasena:  $PwDestino   (generada; queda en $ArchivoEnv)" -ForegroundColor Cyan
} else {
    Write-Host "    Contrasena:  la de $ArchivoEnv (ROAMGATE_PASSWORD)"
}
Write-Host ""
Write-Host "    Estado:      .\roamgate.exe service status   |   .\roamgate.exe herdr status"
Write-Host "    Reiniciar:   .\roamgate.exe service restart  (tras editar roamgate.env)"
Write-Host "    Quitar:      .\roamgate.exe service uninstall"
Write-Host ""
