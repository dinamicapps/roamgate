# Comando: /experts

Presenta al equipo de expertos virtuales disponibles en Agent OS.

## Uso

```
/experts
/experts sentinel
/experts mary
/experts john
/experts sally
/experts winston
/experts bob
/experts quinn
/experts amelia
```

- Sin argumentos: presenta a todos los expertos usando Party Mode (cada uno habla con su voz)
- Con nombre: invoca al experto directamente para que se presente con su personalidad

Expertos disponibles: mary, john, sally, winston, sentinel, tessa, paige, bob, quinn, amelia, atlas, cipher, dexter

## Instrucciones de Ejecucion

### Sin argumentos - presentacion grupal con Party Mode

Invocar `agent-os/skills/party-mode/SKILL.md` con el siguiente topico:

```
El usuario quiere conocer al equipo de expertos. Cada agente debe presentarse brevemente
con su nombre, rol, y en que es experto. Usar su voz y personalidad unica.
Incluir: Mary, John, Sally, Winston, Sentinel, Tessa, Paige, Bob, Quinn, Amelia, Atlas, Cipher, Dexter.
```

Party Mode seleccionara las voces relevantes y cada una se presentara en paralelo con su
personalidad autentica.

Despues de la presentacion de Party Mode, agregar:

```
---
EXPERTOS DE CALIDAD (siempre activos en los gates):
- Bob - Scrum Master: revisa claridad de CAs (RC) y accionabilidad de tareas (RS)
- Quinn - QA Engineer: revisa testeabilidad de cada CA (RT)
- Amelia - Senior Developer: revisa implementabilidad de tareas contra el codebase real (RI)

Para conocer a un experto en detalle: /experts {nombre}
Los expertos se activan automaticamente en /alfred segun la ruta y el tipo de trabajo.
```

---

### Con nombre de experto - presentacion individual

Si el argumento coincide con un nombre (case-insensitive):

1. Mapear nombre a skill:
   - mary ->  `agent-os/experts/bmad-agent-mary/SKILL.md`
   - john ->  `agent-os/experts/bmad-agent-john/SKILL.md`
   - sally ->  `agent-os/experts/bmad-agent-sally/SKILL.md`
   - winston ->  `agent-os/experts/bmad-agent-winston/SKILL.md` (anfitrion del modelo del diseno, capacidad CM)
   - sentinel ->  `agent-os/experts/bmad-agent-sentinel/SKILL.md`
   - tessa ->  `agent-os/experts/bmad-agent-tessa/SKILL.md`
   - paige ->  `agent-os/experts/bmad-agent-paige/SKILL.md`
   - atlas ->  `agent-os/experts/bmad-agent-atlas/SKILL.md`
   - bob ->  `agent-os/experts/bmad-agent-bob/SKILL.md`
   - quinn ->  `agent-os/experts/bmad-agent-quinn/SKILL.md`
   - amelia ->  `agent-os/experts/bmad-agent-amelia/SKILL.md`
   - cipher ->  `agent-os/experts/bmad-agent-cipher/SKILL.md`
   - dexter ->  `agent-os/experts/bmad-agent-dexter/SKILL.md`

2. Invocar el skill del experto y pedirle que se presente al usuario explicando:
   - Su nombre y rol
   - Su personalidad y forma de comunicarse
   - Sus capacidades (tabla de codigos disponibles)
   - Cuando participa en un trabajo (ruta/pieza de /alfred)

3. Si el nombre no coincide con ninguno conocido:
   ```
   Experto "{argumento}" no encontrado.
   Disponibles: mary, john, sally, winston, sentinel, tessa, paige, bob, quinn, amelia, atlas, cipher, dexter
   ```
