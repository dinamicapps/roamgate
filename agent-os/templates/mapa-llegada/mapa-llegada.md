# Mapa de llegada — {nombre del repo}

> Memoria de producto: como llega un usuario a cada pantalla del sistema y que
> necesita traer para operarla. NO es documentacion de features — es el camino.
>
> - **Quien escribe:** Etapa 4. Tessa produce/actualiza la entrada de cada
>   pantalla cuya llegada verifico (procedimiento en su reference E2E); Quinn
>   audita. Se crea desde el seed `agent-os/templates/mapa-llegada/mapa-llegada.md`
>   la primera vez.
> - **Quien consulta:** el discovery de /disenar (pregunta 5) antes de preguntar
>   al usuario, y el plan de prueba de E4 al declarar la ruta de llegada de cada
>   checkpoint de UI.
> - **Frescura por uso:** una entrada se re-toca cada vez que un work verifica la
>   llegada de esa pantalla. Si al recorrerla esta podrida (el menu cambio, el
>   permiso ya no existe), se corrige en el mismo work que la uso — nunca se deja
>   podrida a sabiendas.
> - **Evidencia:** cada entrada lleva citas ancladas (formato en
>   `agent-os/skills/host-protocol/references/cita-anclada.md`).
> - **Definicion canonica:** los campos de cada entrada instancian el
>   contexto de llegada definido en `../diseno/schema/modelo.md` seccion
>   "Contexto de llegada" (la pregunta 5 del discovery lo consume, no lo aloja).

## {Area o modulo}

### {Nombre de la pantalla}

- **Cadena de navegacion:** {menu -> submenu -> accion -> pantalla, como la
  recorre el usuario. Si no tiene entrada de menu: "sin entrada de menu — {razon:
  tool dev gateada / deep-link desde X}"}
- **Permiso:** {codigo del permiso con cita anclada, o "publico"}
- **Prerequisitos del actor:** {IDs/codigos/registros previos que el usuario debe
  traer y EN QUE pantalla los obtiene (incluir formato, ej. "numero de admision
  con prefijo UR"), o "ninguno"}
- **Receta de datos de prueba:** {como fabricar o localizar en el tenant de
  pruebas el dato minimo para recorrer la pantalla, o "dato preexistente: {cual}"}
- **Evidencia:** {citas ancladas archivo:linea + fragmento del route/menu/permiso}
- **Verificado:** {YYYY-MM-DD, work {slug}}
