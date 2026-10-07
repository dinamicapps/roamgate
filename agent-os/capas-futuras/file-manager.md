# Capas futuras — file-manager

Roadmap acumulativo de mejoras futuras al file manager (explorador de archivos del workspace). Cada item viene de un work cerrado donde se identifico una capa de cebolla pero no era el momento de implementarla.

## Items

### 2026-10-07 — File manager como tab nativo de Herdr (opcion A2)
- **Origen:** work `20261007-investigacion-filemanager-tabs`, ficha A2 (`etapa-3/frentes/T-006-ficha-a2.md`, requisitos R-H1..R-H6).
- **Razon:** depende de un sistema externo. Hasta Herdr v0.9.3 / HEAD 4e624cd5 el contenido de un tab es solo un arbol de panes de terminal y el protocolo 22 no ofrece kind ni metadata de tab; requiere que Herdr publique esos requisitos en un protocolo versionado.
- **Notas:** si Herdr los publica, la ficha A2 indica que se desbloquea y que la talla seria al menos L (cruza bridge y Herdr).

### 2026-10-07 — Operaciones de archivo faltantes
- **Origen:** work `20261007-investigacion-filemanager-tabs`, fuera de alcance FA-1 (`etapa-3/insumo-consolidado.md` seccion h).
- **Razon:** el explorador solo lista, previsualiza, busca, descarga, sube y borra; no hay renombrar, mover, crear carpeta ni editar en UI ni backend (`server/src/workspace/local-files.ts`, `server/src/workspace/remote-files.ts`). Quedo fuera del alcance de la investigacion sobre su contenedor.
- **Notas:** cualquier operacion nueva toca el contrato `file.*` del backend (local y SSH) ademas de la UI.
