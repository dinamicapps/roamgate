# roamgate-dist

Canal de distribucion de **Roamgate para Windows, version dinamicapps**. Repo interno de
dinamicapps: aqui se publica el binario ya construido y desde aqui se instala y se usa en tu
maquina.

**Este repo NO contiene fuente: solo el binario empaquetado, su version y el instalador.** Eso es lo
que te permite instalar y actualizar Roamgate **sin clonar el repo de fuentes** ni tener su
toolchain. Si llegaste aqui sin conocer el proyecto, este archivo es todo lo que necesitas leer.

Roamgate es un cliente web (y PWA) para [Herdr](https://herdr.dev): te deja ver y manejar tus
sesiones de Herdr desde el navegador, incluido el iPad por Tailscale. Esta es la version del fork
`dinamicapps/roamgate` (rama `dev`), con los arreglos para Windows que aun no estan en upstream. Se
reconoce por el sufijo de version: `0.7.15-dinamicapps.1`, `0.7.15-dinamicapps.2`, ...

## Solo Windows

El binario es `roamgate.exe` para windows-x64. El instalador aborta en cualquier otro sistema sin
tocar nada.

## Que hay dentro

| Ruta | Que es |
|------|--------|
| `bin/roamgate-windows-x64.zip` | El binario, comprimido. Trae solo `roamgate.exe` |
| `VERSION-roamgate` | Version, sha del fuente y fecha de la publicacion vigente |
| `install.ps1` | El instalador todo en uno: Herdr, `roamgate.exe`, configuracion y arranque automatico |
| `install.sh` | Instalador para Git Bash: solo extrae `roamgate.exe` (modo manual) |
| `roamgate.cmd` | El lanzador manual: arranca Roamgate en primer plano en la IP de Tailscale o en localhost |

Todo se publica desde el repo fuente: no se edita aqui.

**`roamgate.exe` no esta versionado.** Pesa mas de 100 MB, el limite de GitHub por archivo; por eso
viaja como zip y el instalador lo extrae. Tras clonar no lo vas a ver hasta correr el instalador.

## Antes de instalar

- **Windows.** Ver arriba.
- **[Tailscale](https://tailscale.com)** (opcional). Solo si quieres entrar desde otro equipo de tu
  tailnet, como el iPad. Sin Tailscale, Roamgate escucha solo en esta maquina.

[Herdr](https://herdr.dev) ya no es un requisito previo: si no lo tienes, el instalador lo instala
desde su canal oficial (`https://herdr.dev/install.ps1`).

## Instalar

```powershell
git clone git@github.com:dinamicapps/roamgate-dist.git
cd roamgate-dist
.\install.ps1
```

Si PowerShell no te deja correr scripts: `powershell -ExecutionPolicy Bypass -File .\install.ps1`.

Eso es todo. El instalador, en orden:

1. **Herdr.** Lo busca en el PATH y en `%APPDATA%\roamgate\herdr`. Si no esta, lo instala desde
   herdr.dev.
2. **Roamgate.** Extrae `roamgate.exe` a esta carpeta y comprueba que `roamgate.exe --version` diga
   la version de `VERSION-roamgate`.
3. **Configuracion.** Escribe en `%APPDATA%\roamgate\roamgate.env` la IP, el puerto y la
   contrasena, y apaga el aviso de actualizaciones de upstream. Las demas lineas del archivo no se
   tocan.
4. **Arranque automatico.** Registra Herdr y Roamgate como **tareas programadas de tu usuario**.
   Arrancan al iniciar sesion, sin ventana, y se reinician solas si se caen. Si Herdr ya estaba
   corriendo, no lo reinicia (cerraria tus terminales): solo registra su tarea.
5. **Comprobacion.** Espera a que Roamgate responda y te muestra la URL.

No es un servicio de Windows a proposito. Roamgate y Herdr tienen que correr como tu usuario y en tu
sesion: Herdr guarda su socket en tu `%APPDATA%` y sus terminales son las tuyas.

### Parametros

| Parametro | Por defecto | Para que |
|-----------|-------------|----------|
| `-Puerto 8789` | el de `roamgate.env`, o `8787` | Otro puerto, p. ej. si ya tienes otro Roamgate en 8787 |
| `-Ip 127.0.0.1` | el de `roamgate.env`, o la IPv4 de Tailscale, o `127.0.0.1` | Forzar donde escucha |
| `-Password "..."` | ver abajo | Fijar la contrasena de login (15 a 1024 caracteres) |
| `-SinServicio` | | Solo extraer `roamgate.exe`, como antes: no instala Herdr ni toca tareas |

Lo que pases queda guardado en `roamgate.env`: la proxima vez basta con `.\install.ps1`.

### Contrasena

Fuera de localhost Roamgate pide login. El instalador elige la contrasena en este orden:

1. `-Password`.
2. La que ya este en `roamgate.env`, si es valida.
3. La variable `ROAMGATE_PASSWORD`, si es valida.
4. Si no hay ninguna, **genera una** y te la muestra al final. Anotala: queda en `roamgate.env`.

"Valida" quiere decir de 15 a 1024 caracteres: versiones anteriores aceptaban menos.

Para cambiarla despues: edita `ROAMGATE_PASSWORD` en `%APPDATA%\roamgate\roamgate.env` y corre
`.\roamgate.exe service restart`.

## Usarlo

Abre la URL que muestra el instalador, por ejemplo `http://100.x.y.z:8787`, desde esta maquina o
desde el iPad. No hay que dejar ninguna consola abierta.

| Para | Comando |
|------|---------|
| Ver el estado | `.\roamgate.exe service status` y `.\roamgate.exe herdr status` |
| Ver las tareas | `Get-ScheduledTask dev.roamgate*` |
| Reiniciar Roamgate (p. ej. tras editar `roamgate.env`) | `.\roamgate.exe service restart` |

Las tareas corren sin ventana, asi que no hay consola donde ver sus mensajes. Si Roamgate no
arranca, detén su tarea (`Stop-ScheduledTask dev.roamgate-*`, sin `.herdr`) y correlo en primer
plano para ver el error:

```powershell
.\roamgate.exe service run "$env:APPDATA\roamgate\roamgate.env"
```

### Quitar el arranque automatico

```powershell
.\roamgate.exe service uninstall                                                      # Roamgate
Get-ScheduledTask dev.roamgate.herdr-* | Unregister-ScheduledTask -Confirm:$false     # Herdr
```

Quitar la tarea de Herdr no detiene el Herdr que esta corriendo: solo deja de arrancar al iniciar
sesion.

### Modo manual (sin tareas)

Si prefieres arrancarlo tu, instala con `.\install.ps1 -SinServicio` y arranca con:

```powershell
.\roamgate.cmd
```

Escucha en la IPv4 de Tailscale (o `127.0.0.1`) y el puerto `8787`. Para cambiarlos define
`$env:ROAMGATE_PORT` y `$env:ROAMGATE_HOST` antes de arrancar. La contrasena la toma de la variable
`ROAMGATE_PASSWORD` (15 caracteres o mas); sin ella, Roamgate genera un token y la consola muestra
su ruta. Deja la consola abierta mientras lo uses; `Ctrl+C` lo detiene.

`install.sh` (Git Bash) instala siempre en este modo manual.

## Actualizar

**El mismo comando.** Actualizar es reinstalar: no hay un segundo mecanismo que aprender.

```powershell
git pull
.\install.ps1
```

Nada se actualiza solo: no hay auto-update. Tu decides cuando corres esto.

Si Roamgate corre con su tarea, el instalador la detiene, reemplaza `roamgate.exe` y la vuelve a
arrancar: no tienes que cerrar nada. Si lo arrancaste a mano con `roamgate.cmd`, cierralo antes.
Windows no deja sobrescribir un `.exe` en uso, y el instalador no detiene procesos que no son de su
tarea.

Si ya tienes esa misma version, no extrae nada, pero vuelve a aplicar la configuracion y las tareas.

## Volver a una version anterior

Cada publicacion queda etiquetada (`roamgate-v0.7.15-dinamicapps.2`,
`roamgate-v0.7.15-dinamicapps.1`, ...). Para volver a una, te paras en su tag y reinstalas — **por
el mismo camino de siempre**:

```powershell
git tag                                      # ver que versiones hay publicadas
git checkout roamgate-v0.7.15-dinamicapps.1
.\install.ps1
```

Para volver al ultimo publicado:

```powershell
git checkout main
git pull
.\install.ps1
```

Las versiones anteriores a `0.7.15-dinamicapps.4` no saben detener la tarea de Roamgate. Antes de
volver a una de ellas, quita el arranque automatico (`.\roamgate.exe service uninstall`) y usa el
modo manual.
