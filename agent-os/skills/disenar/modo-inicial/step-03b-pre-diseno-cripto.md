# step-03b: Pre-diseño criptografico (condicional)

> Anfitrion: Cipher [MC]. Step CONDICIONAL: se ejecuta solo si el diseño tiene dimension criptografica. Lee completo, ejecuta en orden. Termina con P/C. Solo C avanza.

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo se documenta la mecanica del step. NO duplicar los principios — para modificar, editar la fuente. -->

## Lo propio de esta etapa

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "Los ocho pasos". El ciclo completo vive alli. Aqui solo lo propio de esta etapa. NO duplicar el molde — para modificar, editar la fuente. -->

| | |
|---|---|
| Subgrafo de entrada | los `proceso` que firman, estampan, cifran o hashean; las `entidad` que persisten material firmado o cifrado (juntura con Dexter); y las `restriccion` normativas que exigen alguna de esas operaciones |
| Consume | `proceso`, `entidad`, `restriccion` |
| Emite | `operacion_cripto`, `llave`, y las aristas `EJECUTA` y `USA_LLAVE` |
| Valida | `agentos modelo validar --slug {slug} --etapa cripto` |
| Frontera del artefacto | `criptografia.md`: entre los marcadores el inventario y la matriz proyectados; fuera, el valor probatorio razonado, la cadena de confianza y las derivas observadas, que son juicio de Cipher |

## Activacion (gate de entrada)

Tras cerrar step-03, Mary evalua el modelo: si algun nodo toca firma, estampa/sellado de
tiempo, certificados, llaves, cifrado, tokens criptograficos o hashing de credenciales — en
su enunciado, su nombre o su cita — el step se activa. La señal es el modelo, no que alguien
note la dimension criptografica leyendo el intent. Sigue siendo juicio de Mary sobre el
modelo, no una comprobacion de schema.

**Dos caminos, y hasta hoy se contradecian** entre esta tarjeta y la de Cipher. El handoff
ya arbitraba (`step-09`); aqui se alinean.

**1. Mary revisa el modelo cerrado y ningun nodo toca la dimension criptografica.** El step
no se activa: declaracion en bitacora ("step-03b omitido: sin dimension criptografica,
revisado el modelo") y **sin artefacto**. Cipher nunca se activo, y hacerle instanciar un
documento a un experto que no participo produce una declaracion sin autor.

**2. Cipher se activo y concluye que no aplica.** Reviso, y su busqueda ES el hallazgo:
instancia `criptografia.md` con la declaracion positiva y la evidencia de que busco, y cierra
con `confianza_resuelta: true`. Es la rama espejo de `no-aplica-sin-datos` de Dexter.

En **ambos** casos `modelo validar --etapa cripto` no corre y los tres predicados no aplican:
la etapa es condicional y sigue siendolo. Y en ambos, la declaracion en bitacora satisface la
entrada `no-aplica-sin-cripto` del handoff — **salvo que un freno de Cipher se dispare aguas
abajo** (step-04 o step-07), en cuyo caso la omision queda superada y `criptografia.md` debe
existir.

**3. Con nodos que tocan la dimension criptografica:** ejecutar este step completo.

## Pre-condicion

- step-03 cerrado (datos.md con `persistencia_resuelta: true`).
- El modelo (`modelo.yml`) trae los nodos que tocan la dimension criptografica — el insumo
  de Cipher.

## Mision

Cipher [MC] produce `agent-os/disenos/{slug}/criptografia.md`: inventario de operaciones criptograficas, decisiones por operacion (formato/nivel de firma, TSA, algoritmos parametrizados, custodia de llaves, cadena de confianza), valor probatorio declarado por documento, y matriz operacion-llave. La confianza precede a los procesos: un proceso que firma sin custodia resuelta es un proceso decorado.

## Pasos

1. **Cipher se activa** con prefijo `A-Cipher:`. Carga su memoria (sidecar de derivas) y el standard `agent-os/standards/security/criptografia/` si existe.

2. **Hereda el insumo del modelo y de step-03:** lee los nodos de `modelo.yml` que tocan
   firma, llaves, custodia, cifrado o hashing de credenciales — con su cita — y `datos.md`
   (que entidades persisten material firmado/cifrado — juntura con Dexter).

3. **Ancla antes de opinar (P-C7):** inspecciona los archivos/configs/certificados reales que el contexto senala y declara que leyo.

4. **Instancia criptografia.md** via runtime con el schema `diseno-cripto`.

   <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

   ```bash
   # 1) Write tool -> .tmp-body.md con las secciones de JUICIO (decisiones por
   #    operacion, cadena de confianza, valor probatorio razonado, derivas) y los
   #    marcadores <!-- modelo:start vista=cripto --> / <!-- modelo:end --> donde
   #    entraran el inventario y la matriz proyectados en el paso 4c
   # 2) Invocar con --body-file:
   echo '{
     "diseno_slug": "{slug}",
     "ruta_relativa": "criptografia.md",
     "file_type": "diseno-cripto",
     "frontmatter": {
       "diseno_slug": "{slug}",
       "brief_version": 1,
       "confianza_resuelta": false,
       "dominios_tocados": [],
       "derivas_observadas": []
     }
   }' | agentos diseno file create --body-file .tmp-body.md
   # 3) rm .tmp-body.md
   ```

4b. **Emitir al grafo por lote.** El inventario y la matriz **no viven en prosa**: son nodos.

   ```bash
   # 1) Write tool -> .tmp-lote.json
   echo '{
     "nodos": [
       {"id": "OPC_FirmarHC", "tipo": "operacion_cripto", "estado": "resuelto",
        "campos": {"nombre": "firmar historia clinica", "naturaleza": "firma",
                   "algoritmo": "RSA-PSS 3072, SHA-256",
                   "valor_probatorio": "firma digital con certificado acreditado",
                   "existencia": "nueva"}},
       {"id": "LLV_FirmaClinica", "tipo": "llave", "estado": "resuelto",
        "campos": {"nombre": "llave de firma clinica", "custodia": "Azure Key Vault HSM",
                   "proposito": "firmar historia clinica", "rotacion": "anual",
                   "existencia": "nueva"}}
     ],
     "aristas": [
       {"tipo": "EJECUTA", "de": "P3", "a": "OPC_FirmarHC"},
       {"tipo": "USA_LLAVE", "de": "OPC_FirmarHC", "a": "LLV_FirmaClinica"}
     ]
   }' > .tmp-lote.json
   agentos modelo emitir --slug {slug} --etapa cripto --input .tmp-lote.json
   rm .tmp-lote.json

   agentos modelo validar --slug {slug} --etapa cripto
   ```

   **`EJECUTA` sale de un proceso que ya existe.** Esta etapa corre antes de la de procesos,
   pero el FOCO ya emitio los nodos `proceso` en estado `abierto` — la etapa de procesos los
   cierra despues. Cipher declara la arista contra un nodo que existe; no hay que esperar a
   nadie.

   Tres hallazgos propios: `OPERACION_SIN_PROCESO` (ningun proceso la ejecuta),
   `OPERACION_SIN_LLAVE` (resuelta sin llave, con `naturaleza: hash` **exenta** porque un
   hash sin llave es legitimo) y `LLAVE_MULTIPROPOSITO` (una llave usada por operaciones de
   naturaleza distinta — P-C2 "una llave, un uso" en su forma verificable).

   Una `operacion_cripto` resuelta **exige prosa anclada**: el porque del nivel de firma y
   del valor probatorio no cabe en ningun campo. La `llave` no la exige — custodia,
   proposito y rotacion SON sus campos.

4c. **Proyectar el artefacto:**

   ```bash
   agentos modelo proyectar --slug {slug} --vista cripto
   ```

   Reemplaza lo que hay entre `<!-- modelo:start vista=cripto -->` y `<!-- modelo:end -->`.

5. **Llena las secciones de juicio, que quedan FUERA de los marcadores** (ver reference
   modelar-cripto.md): decision por operacion con norma aplicable (P-C4), cadena de confianza
   esperada, valor probatorio razonado por documento, y derivas observadas.

6. **Junturas:** si una decision toca esquema de datos (columna de hash, blob cifrado, token persistido) o superficie de API (endpoint de firma, validacion de token), Cipher convoca la juntura con Dexter y/o Sentinel ANTES de fijarla. <!-- FUENTE: agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md seccion "Protocolo (4 reglas)". NO duplicar — para modificar, editar la fuente. -->

7. **Sello anti-evasion** antes de cerrar: sin lenguaje de decision diferida, sin algoritmo sin parametros, sin llave sin custodia, sin firma sin valor probatorio declarado. Si limpio, setear `confianza_resuelta: true` (Edit sobre el frontmatter). Si no, resolver antes de cerrar.

   **Tres de las cuatro señales son ahora forma verificable**: que exista `algoritmo`, que
   exista `custodia`, que exista `valor_probatorio`. El verbo las rechaza si faltan, sin que
   nadie tenga que acordarse.

   Lo que **no** se mecaniza, y sigue siendo de Cipher: que `"RSA"` sea insuficiente y
   `"RSA-PSS 3072, SHA-256"` bastante. El runtime no puede juzgar si un algoritmo trae sus
   parametros — solo si el campo esta. El lenguaje de decision diferida ("TBD", "alli
   veremos") tampoco: eso se lee, no se cuenta.

8. **Bitacora:**

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
echo "
## $(date +%Y-%m-%d) — step-03b cerrado

criptografia.md producido.
Operaciones criptograficas: {N}. Llaves con custodia resuelta: {M}. Junturas convocadas: {K}.
Valor probatorio declarado: {resumen}.
Derivas observadas: {resumen o 'ninguna'}.
confianza_resuelta: true
" >> agent-os/disenos/{slug}/bitacora.md
```

## Cierre

```
A-Cipher: criptografia.md producido.

Operaciones: {N}. Llaves: {M} con custodia y ciclo de vida resueltos.
Valor probatorio: {escala declarada por documento}.
Junturas: {K convocadas, todas ACORDADAS o escaladas}.
Sello anti-evasion: PASS. confianza_resuelta: true.

En step-04 los procesos se discuten SOBRE estas decisiones. Si un proceso
revela una operacion criptografica nueva, Cipher refina criptografia.md
(refinamiento conjunto). Las decisiones aqui son firmes, no finales.

Menu (la opcion P requiere anchor declarado —
ver advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):

  P — convocar juntura con Dexter/Sentinel si quedo una zona de contacto abierta.
  C — continuar a step-04 (procesos y contratos).
```

<!-- FUENTE: agent-os/skills/advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia". Cipher declara anchor (que archivos/configs/certificados leyo) antes de P. NO duplicar la regla — para modificar, editar la fuente. -->

## Post-condicion

- `agent-os/disenos/{slug}/criptografia.md` poblado con `confianza_resuelta: true` (o step omitido con declaracion en bitacora).
- Si C: avanzar a step-04.

## Prohibiciones

- NO definir procesos aun (step-04).
- NO generar ni manipular material de llave real durante el diseño (P-C8). Los nombres de llaves en criptografia.md son logicos.
- NO cerrar con `confianza_resuelta: false`. La unica alternativa valida es la omision declarada del step (gate de entrada).
- NO escribir material sensible (llaves, secretos, fragmentos de certificado privado) en NINGUN artefacto del diseño.
- NO leer step-04 hasta cerrar este step.
