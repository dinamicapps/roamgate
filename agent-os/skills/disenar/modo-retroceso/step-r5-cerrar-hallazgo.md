# step-r5: Cerrar hallazgo y volver a r1

## Mision

Marcar el hallazgo como `mitigado`. Llenar seccion "Mitigacion aplicada por
diseño" del archivo de hallazgo. Volver a step-r1 para siguiente.

## Pasos

1. **Cerrar el hallazgo (runtime).** Un solo comando muta el estado de la ficha, sincroniza el
   diseño (contadores + derivación de retroceso) **y** transiciona el nodo del grafo. Los tres
   en la misma operación: separarlos serían tres oportunidades de divergir.

```bash
# detectar binario y parsear {ok,data}; patron en gestion/readme.md de Alfred.
agentos diseno hallazgo --slug {slug} --id HZ-{NNN} --a mitigado
```

   Lo que le pasa al nodo `hallazgo` segun el estado destino:

| Estado de la ficha | Nodo `hallazgo` |
|---|---|
| `en_analisis`, `mitigado` | sigue `abierto` |
| `aplicado` | `resuelto` |
| `obsoleto_por_replanteamiento`, `descartado`, `descartado_por_cancelacion` | `descartado` — **exige `--razon`** |

   La salida rinde `nodo` y `nodo_estado`. Si rinde `nodo_motivo`, la ficha no declaraba
   `invalida` y el hallazgo quedo fuera del grafo: volver a r1 paso 5b.

   **Tras este paso el nodo queda `abierto`, y eso es correcto: el retroceso NO lo cierra.**
   `mitigado` dice "el diseño ya lo corrigio"; el nodo se cierra cuando un work consume el
   cambio y alguien transiciona la ficha a `aplicado` —la unica transicion que lo deja
   `resuelto`—. El grafo lleva la segunda afirmacion, no la primera.

   La consecuencia es buscada: `MODELO_ABIERTO` reclama todo nodo abierto al cerrar el brief,
   asi que **un cambio mitigado y todavia no aplicado impide volver a cerrar el diseño**. No
   estorba mientras tanto: el diseño vuelve a `EN_USO` y los works leen el brief sin correr esa
   compuerta.

2. **Llenar seccion del hallazgo:**

Editar `HZ-{NNN}.md`, seccion "Mitigacion aplicada por diseño":

```markdown
## Mitigacion aplicada por diseño

Fecha: {YYYY-MM-DD}.
brief_version resultante: {N+1}.

Cambios:
- {archivo modificado:articulo}: {descripcion del cambio}.

Razon: {razon textual de la mitigacion}.
```

3. **Volver a step-r1** con la lista de pendientes restantes.

4. **Si no quedan pendientes:** la sincronización del paso 1 ya regresó el diseño a `EN_USO` automáticamente (lo confirma el campo `estado_diseno` en la salida del comando). Anunciar:

```
A-Mary: Todos los hallazgos del retroceso quedan mitigados. El diseño
vuelve a EN_USO. brief_version actual: {N}.

Los works consumidores con hallazgos mitigados pendientes de aplicacion
veran el diff en su pre-flight de /alfred continuar.
```
