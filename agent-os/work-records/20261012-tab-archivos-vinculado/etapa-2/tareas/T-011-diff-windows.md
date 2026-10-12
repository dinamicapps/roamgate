---
archivos:
  - accion: modificar
    ruta: server/src/workspace/git-diff.ts
  - accion: modificar
    ruta: server/src/workspace/git-diff.test.ts
cas:
  - CA-16
  - CA-26
depende_de:
  - T-010
ejecutor: atlas
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: false
fase: 7
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: null
---
# Tarea 011: Diff del servidor en Windows (FM-06)

`git.diff_file` falla con `invalid Git patch size` (server/src/workspace/git-diff.ts:408) en Windows: Changes no muestra diffs y CA-16 no se puede verificar. El work se reabrio para no dejar CAs sin verificar.

## Subtareas

1. Reproducir: ejecutar el script del diff en este host y capturar stdout real (primera linea).
2. Corregir la causa raiz sin romper Linux/macOS/SSH.
3. Prueba que fije el caso de Windows.

## Verificacion

1. Pruebas del modulo en verde.
2. Changes del Inspector muestra el diff de un archivo modificado en este Windows.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-16 | Abrir desde Changes abre el archivo en el tab de archivos | DEC_P1_changes_cierra_inspector |
| CA-26 | Ver cambios desde el tab muestra el diff en el Inspector | DEC_D8_inspector_changes |

## Ejecutor: atlas

### Que hizo

- Causa raiz: Git for Windows sin etc/fstab mapea /tmp a su directorio de instalacion no escribible y el proceso lanzado desde Explorer no tiene TMPDIR; mktemp fallaba.
- El script salia con exit 1, el mismo codigo de hay diff, y el error real quedaba oculto tras invalid Git patch size.
- readGitPatch prueba TMPDIR/tmp y luego TMP/TEMP; si ambos fallan sale con exit 2 y el stderr real llega al RPC; el trap de senales pasa a exit 129.
- Mismo patron corregido en terminal-upload.ts:54 y update.ts:524; barrido de /tmp en server/src con razon de los no tocados.
- Tres pruebas nuevas que fallan sin el arreglo; git-diff 12 pass (20 fallas previas de last-step), terminal-upload 20/0, update 26/2 previas; tsc del server limpio.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | snapshotWorktreeTree (modo last-step) falla en Windows con ulimit: file size (git-diff.ts:441); causa las 20 fallas restantes | Funcion distinta fuera del work; se registra en post-works | amelia |
| 2 | Archivos no declarados: terminal-upload.ts, update.ts y sus pruebas | Aceptados: mismo patron de la causa raiz, corregido en la misma tarea | amelia |
| 3 | A la instalacion de Git for Windows del host le faltan etc/fstab y etc/profile | Entorno del usuario; se le informa. El codigo ya no depende de ello | amelia |
