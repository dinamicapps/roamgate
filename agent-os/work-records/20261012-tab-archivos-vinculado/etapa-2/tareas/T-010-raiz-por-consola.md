---
archivos:
  - accion: modificar
    ruta: server/src/workspace/files.ts
  - accion: modificar
    ruta: server/src/workspace/files.test.ts
  - accion: modificar
    ruta: web/src/components/fileExplorerResources.ts
  - accion: modificar
    ruta: web/src/components/FilesTabSurface.tsx
  - accion: modificar
    ruta: web/src/components/WorkspaceFilesView.tsx
  - accion: modificar
    ruta: web/src/filesTabResource.ts
  - accion: modificar
    ruta: web/src/App.tsx
cas:
  - CA-11
  - CA-12
  - CA-08
depende_de:
  - T-009
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 6
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: null
---
# Tarea 010: Raiz del tab de archivos por consola

H-E4-01: en workspaces sin worktree, el servidor resuelve la raiz del explorador con el cwd del pane enfocado del workspace (server/src/workspace/files.ts:79-95), no con el de la consola duena del tab de archivos. Ajuste acotado decidido por el usuario ([OVERRIDE] en Decisiones clave): file.* acepta la consola duena para resolver la raiz; sin operaciones de archivo nuevas.

## Subtareas

1. Servidor: los RPC file.* que usa el explorador aceptan `tab_id` opcional. Se valida que el tab pertenezca al workspace. Con tab_id y sin worktree, la raiz es la raiz git del cwd del pane enfocado de ese tab (o del primer pane del tab), o ese cwd si no esta en un repo. Sin tab_id el comportamiento no cambia (Inspector, otros consumidores). Nunca se acepta una ruta de raiz del cliente.
2. Cliente: el tab de archivos envia su ownerTabId en todas las llamadas file.* de su superficie; las caches de fileExplorerResources se separan por raiz/consola para que dos tabs del mismo workspace no compartan arbol (CA-08).
3. Vinculo: el directorio inicial se calcula relativo a la raiz que devuelve el servidor (checkout_path de la respuesta) a partir del cwd del pane al crear el vinculo, una sola vez; lectura tolerante de vinculos previos.
4. Pruebas de servidor (files.test.ts) y de cliente para la resolucion y el directorio inicial.

## Verificacion

1. bun test server/src y web/src sin fallas nuevas; typecheck; build web dentro de presupuesto.
2. Navegador: dos consolas del mismo workspace en carpetas distintas muestran cada una su raiz y su carpeta inicial, sin cambiar al mover el foco (CA-11, CA-12, CA-08).

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-11 | El tab nace en el cwd del pane enfocado de su consola, relativo a la raiz de esa consola | REG_P1_raiz_al_crear |
| CA-12 | Con cwd fuera de un repo, la raiz es ese cwd | REG_cwd_fuera_raiz_abre_raiz |
| CA-08 | Dos tabs de consolas distintas no comparten arbol ni estado | INV-PUENTE-01 |

## Ejecutor: amelia

### Que hizo

- Servidor: file.list, file.read, file.search, file.resolve, file.reveal y las rutas HTTP download/upload/delete aceptan tab_id opcional, validado contra el workspace.
- Con tab_id y sin worktree la raiz es el toplevel git del cwd del pane enfocado de esa consola, o ese cwd fuera de un repo; cache de 5 s; sin tab_id nada cambia.
- Cliente: la superficie del tab envia ownerTabId en todas sus llamadas file.* y URLs de preview; caches del explorador separadas por consola (owner#tab:id).
- Vinculo: guarda initialCwd al crearse y deriva initialDirectory una sola vez con el checkout_path de la primera respuesta; vinculos previos se leen igual.
- Pruebas: 5 de servidor, 2 de cache/preview y 2 de vinculo; files.test 10/10, web sin fallas nuevas, typecheck limpio, build 160/160.
- Navegador (anfitriona, workspace fm-prueba2 creado y cerrado): web abre en la raiz git con web/src expandido y la conserva al mover el foco; out abre en su cwd.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Archivos no declarados: server/src/index.ts, FileExplorerDialog.tsx(.test), FilePreviewContent.tsx, workspaceFileUrl.ts, fileManager.ts, types.ts | Aceptados: son los puntos por donde pasan las llamadas file.* y URLs del explorador | amelia |
| 2 | relativePathWithinCheckout distingue mayusculas (workspaceResource.ts:131-137); en Windows una capitalizacion distinta cae a la raiz | No se reprodujo en la prueba; se registra en post-works | amelia |
| 3 | file.resolve de links de terminal (TerminalView.tsx:375) sigue resolviendo contra el pane enfocado del workspace | Fuera de la superficie del tab; se registra en post-works | amelia |
| 4 | Al abrir, el foco de teclado queda en la primera fila y no en el directorio inicial expandido | Cosmetico; se registra en post-works | amelia |
