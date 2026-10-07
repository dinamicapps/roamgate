---
diseno_slug: "{slug}"
gate_discovery: pendiente   # pendiente | completo | override-usuario -- solo aplica al regimen `lineal` (ver abajo)
---

# Discovery — {slug}

> **Regimen `modelo` (diseños nuevos):** este artefacto ya no se escribe a
> mano. Se proyecta desde el modelo con
> `agentos modelo proyectar --slug {slug} --vista discovery`, que arma las 5
> preguntas del aterrizaje a partir de los nodos que las responden, con la cita
> de los que afirman algo del mundo preexistente. Una respuesta que **propone**
> algo que todavia no existe sale `sin cita`, y eso es correcto: la capacidad
> `nueva` de la pregunta 1 y la pantalla o el endpoint nuevos de la pregunta 5
> no tienen que citar. Editar esta salida no tiene efecto: la fuente son los
> nodos del modelo, no la prosa.
>
> Que campo lleva cada tipo de nodo vive en `./schema/modelo.md`. Que pregunta
> responde cada tipo de nodo, y las cuatro condiciones bajo las que el FOCO
> cierra, viven en
> `agent-os/skills/disenar/modo-inicial/step-01-foco.md` seccion "Las cuatro
> condiciones de cierre" (tabla "Donde cae cada pregunta").
>
> **Regimen `lineal` (diseños que arrancaron antes del modelo):** este archivo
> se sigue escribiendo a mano, con el frontmatter y el gate declarados arriba.
> Su procedimiento vive en
> `agent-os/skills/disenar/lineal/step-02-contexto.md`.
