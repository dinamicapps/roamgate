@echo off
rem roamgate.cmd - arranca Roamgate (fork dinamicapps) desde esta carpeta del dist.
rem
rem Publicado por scripts/publicar-dist.ts del repo fuente. No se edita aqui.
rem
rem Host:   ROAMGATE_HOST si esta definida; si no, la IPv4 de Tailscale de esta maquina
rem         (para entrar desde el iPad u otro equipo de la tailnet); si no, 127.0.0.1.
rem Puerto: ROAMGATE_PORT si esta definida; si no, 8787.
setlocal

if not exist "%~dp0roamgate.exe" (
  echo   [ABORT] falta roamgate.exe en %~dp0
  echo           corre install.ps1 en esta carpeta para extraerlo de bin\roamgate-windows-x64.zip
  exit /b 1
)

set "RG_HOST=%ROAMGATE_HOST%"
if not "%RG_HOST%"=="" goto :puerto

rem Primera linea de `tailscale ip -4`. Sin Tailscale, o sin sesion, no imprime nada en stdout.
where tailscale >nul 2>nul || goto :local
for /f "usebackq delims=" %%i in (`tailscale ip -4 2^>nul`) do (
  if not defined RG_HOST set "RG_HOST=%%i"
)

:local
if "%RG_HOST%"=="" set "RG_HOST=127.0.0.1"

:puerto
set "RG_PORT=%ROAMGATE_PORT%"
if "%RG_PORT%"=="" set "RG_PORT=8787"

echo   Roamgate en http://%RG_HOST%:%RG_PORT%
"%~dp0roamgate.exe" --host %RG_HOST% --port %RG_PORT%
exit /b %ERRORLEVEL%
