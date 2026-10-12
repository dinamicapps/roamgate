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
| `install.ps1` / `install.sh` | El instalador: extrae `roamgate.exe` a esta carpeta |
| `roamgate.cmd` | El lanzador: arranca Roamgate en la IP de Tailscale o en localhost |

Todo se publica desde el repo fuente: no se edita aqui.

**`roamgate.exe` no esta versionado.** Pesa mas de 100 MB, el limite de GitHub por archivo; por eso
viaja como zip y el instalador lo extrae. Tras clonar no lo vas a ver hasta correr el instalador.

## Antes de instalar

- **Windows.** Ver arriba.
- **[Herdr](https://herdr.dev).** Roamgate es su cliente: sin Herdr arranca, pero no tiene nada que
  mostrar. El instalador avisa si `herdr` no esta en el PATH, sin abortar. Si te falta, Roamgate
  puede instalarlo:

  ```powershell
  .\roamgate.exe herdr setup
  ```

- **[Tailscale](https://tailscale.com)** (opcional). Solo si quieres entrar desde otro equipo de tu
  tailnet, como el iPad. Sin Tailscale, Roamgate escucha solo en esta maquina.

## Instalar

```powershell
# Windows (PowerShell)
git clone git@github.com:dinamicapps/roamgate-dist.git
cd roamgate-dist
.\install.ps1
```

```bash
# Git Bash
bash install.sh
```

Si PowerShell no te deja correr scripts: `powershell -ExecutionPolicy Bypass -File .\install.ps1`.

El instalador deja `roamgate.exe` en esta misma carpeta, junto a `roamgate.cmd`, y comprueba que
`roamgate.exe --version` diga la version de `VERSION-roamgate`. No toca nada fuera de esta carpeta.

## Arrancar

```powershell
.\roamgate.cmd
```

Imprime la URL y arranca. Por defecto:

- **Host**: la IPv4 de Tailscale de esta maquina (`tailscale ip -4`); si no hay Tailscale, o no
  tiene sesion, `127.0.0.1`.
- **Puerto**: `8787`.

Para cambiarlos, define las variables antes de arrancar:

```powershell
$env:ROAMGATE_PORT = "8789"          # otro puerto
$env:ROAMGATE_HOST = "127.0.0.1"     # forzar solo esta maquina
.\roamgate.cmd
```

Abre la URL que imprime (por ejemplo `http://100.x.y.z:8787`). Fuera de localhost Roamgate pide
login:

- **Con `ROAMGATE_PASSWORD` definida**, entras con esa contraseña. Debe tener **15 caracteres o
  mas**: versiones anteriores aceptaban menos, y con una corta el arranque falla con
  `Login password must contain at least 15 characters`. `install.ps1` te avisa si la tuya es corta.
  Para fijarla: `setx ROAMGATE_PASSWORD "<15 o mas caracteres>"` (agrega `/M` para toda la maquina) y
  abre una consola nueva.
- **Sin la variable**, Roamgate genera un token, lo guarda en un archivo y la consola muestra su ruta
  (`authentication required mode="generated token" path=...`).

Deja la consola abierta mientras lo uses; `Ctrl+C` lo detiene.

## Actualizar

**El mismo comando.** Actualizar es reinstalar: no hay un segundo mecanismo que aprender.

```powershell
git pull
.\install.ps1
```

Nada se actualiza solo: no hay auto-update. Tu decides cuando corres esto.

**Cierra Roamgate antes.** Windows no deja sobrescribir un `.exe` en uso: si `roamgate.exe` esta
corriendo desde esta carpeta, el instalador te lo dice y no toca nada — **no detiene ningun
proceso**. Cierralo, vuelve a correr el instalador y arranca de nuevo con `roamgate.cmd`.

Si ya tienes esa misma version instalada, el instalador te lo dice y no escribe nada.

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

Cierra Roamgate antes de reinstalar, igual que al actualizar.
