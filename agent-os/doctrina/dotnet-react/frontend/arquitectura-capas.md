# Doctrina de capas: frontend (perfil dotnet-react)

<!-- FUENTE: agent-os/doctrina/global/principios-ingenieria.md seccion "Los anti-patrones canonicos". El vocabulario (DRY, acoplamiento, cohesion) y la definicion general del God Component viven alli. Este archivo solo aterriza el remedio concreto para el perfil dotnet-react (React). NO duplicar la regla — para modificar el vocabulario, editar la fuente. -->

Aplica al codigo **nuevo** en el frontend React del perfil dotnet-react. Codigo existente tocado sigue el arbol de decision de la doctrina de expertos (guia+hallazgo sin garantia de prueba; sugerencia de refactor con garantia de prueba) — este archivo no fuerza refactor de legacy, define el objetivo cuando se construye o se refactoriza.

Precedencia: si el repo consumidor tiene un standard propio en `agent-os/standards/` que cubre lo mismo, ese gana sobre esta doctrina del sistema. <!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md seccion "Doctrina del sistema vs standard del consumidor". Regla completa de precedencia alli. NO duplicar. -->

## Las 3 capas minimas

Traduccion del Eje B (capas de una app cliente moderna) al idioma React del perfil dotnet-react:

### 1. Conectividad/HTTP + DTOs — capa `services`/`api`

Todo `fetch`/HTTP pasa por la capa de servicios. Un componente o un hook **nunca llama `fetch` directo** — llaman a una funcion del servicio que ya sabe el endpoint, el metodo HTTP y la forma del DTO de respuesta.

```javascript
// services/api/canalesApi.js
import { httpService } from "../httpService";
import { endpoints } from "../../utilities/endpoints";

export const canalesApi = {
  listar: () => httpService.get(endpoints.canales.listar),
  asignarHumano: (idSlot, idUsuario) =>
    httpService.post(endpoints.canales.asignarHumano(idSlot), { idUsuario }),
};
```

- Los DTOs (la forma de lo que entra y sale del servicio) quedan explicitos en la funcion — nombre del campo, tipo esperado — aunque el proyecto sea JavaScript sin tipado estatico (JSDoc es aceptable para documentar la forma).
- El envelope de respuesta (`{ error, mensaje, dato }`) se resuelve aqui o en `httpService`, no en el componente.

### 2. Logica de componentes / flujos — custom hooks

Un hook custom (`useNombre`) orquesta estado, llama a la capa de servicios (nunca a `fetch` directo) y expone datos + acciones. Un hook por responsabilidad: datos, formulario, acciones.

```javascript
// hooks/useCanales.js
import { useState } from "react";
import { canalesApi } from "../services/api/canalesApi";

export const useCanales = () => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const resp = await canalesApi.listar();
      if (!resp.error) setDatos(resp.dato);
    } finally {
      setCargando(false);
    }
  };

  return { datos, cargando, cargar };
};
```

### 3. Presentacion / layout — CSS Modules / hoja separada

El markup y el estilo viven en archivos propios. Nada de `style={{ ... }}` inline para layout/color/tipografia de uso general; cambiar estado visual es alternar una clase, no calcular un objeto de estilos en JS.

```javascript
// components/TablaCanales.module.css
.contenedor { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 6px; }
.filaActiva { background: var(--bg-card); }
.vacio { padding: 12px; color: var(--text-muted); }
```

```jsx
// components/TablaCanales.jsx
import styles from "./TablaCanales.module.css";

export function TablaCanales({ datos, cargando }) {
  if (cargando) return <div className={styles.vacio}>Cargando...</div>;
  return (
    <div className={styles.contenedor}>
      {datos.map((fila) => (
        <div key={fila.id} className={fila.activo ? styles.filaActiva : undefined}>
          {fila.nombre}
        </div>
      ))}
    </div>
  );
}
```

## Anti-patron: God Component (variante React)

**Definicion:** un componente que mezcla las tres capas en un solo archivo — logica de datos (`fetch`/HTTP inline dentro del componente o en un `useEffect` sin pasar por la capa de servicios), logica de flujos (estado, validaciones) y presentacion (markup con estilos inline o un bloque `<style>` embebido). Es el equivalente frontend del Fat/God Controller: baja cohesion (el archivo hace de todo) + alto acoplamiento (cualquier cambio de estilo, de endpoint o de flujo obliga a tocar el mismo archivo).

**Caso ilustrativo (olor real, dashboard todo-en-uno):** un modulo de dashboard que genera un documento HTML completo desde una funcion, con ~460 lineas de CSS embebidas en un bloque `<style>`, mas de una decena de estilos inline (`style="..."`) repartidos en el markup, y llamadas `fetch(...)` directas dentro del `<script>` de la pagina — reinventando un design-system que el propio repositorio ya expone por separado. Aunque ese caso es HTML generado desde el servidor (no JSX), el mismo olor aparece en un componente React cuando:

```jsx
// ANTES (smell): God Component
import { useState, useEffect } from "react";

export function PaginaCanales() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    fetch("/api/canales/listar")
      .then((r) => r.json())
      .then((json) => setDatos(json.dato));
  }, []);

  return (
    <div style={{ background: "#1a1b26", padding: 20, borderRadius: 6 }}>
      <h2 style={{ color: "#7dcfff", fontSize: 14 }}>Canales</h2>
      {datos.map((c) => (
        <div key={c.id} style={{ padding: 8, borderBottom: "1px solid #3b4261" }}>
          {c.nombre}
        </div>
      ))}
    </div>
  );
}
```

**Sintomas generales:** `fetch`/`axios` dentro de un componente o de un `useEffect` sin pasar por la capa de servicios; objetos `style={{ ... }}` con valores de color/layout de uso general (en vez de una clase); un solo archivo `.jsx` de mas de 200-300 lineas que mezcla obtencion de datos, calculo de estado y markup extenso.

**Remedio: hooks + services + CSS Modules, patron container/presentational.**

```jsx
// DESPUES: container (usa el hook, sin markup pesado ni fetch)
import { useEffect } from "react";
import { useCanales } from "./hooks/useCanales";
import { TablaCanales } from "./components/TablaCanales";

export function PaginaCanales() {
  const { datos, cargando, cargar } = useCanales();
  useEffect(() => { cargar(); }, []);
  return <TablaCanales datos={datos} cargando={cargando} />;
}
```

`PaginaCanales` (container/smart) orquesta el hook y delega el markup a `TablaCanales` (presentational/dumb, seccion 3 arriba), que solo recibe props y renderiza. El `fetch` vive en `canalesApi` (seccion 1), el estado y el flujo de carga viven en `useCanales` (seccion 2), y el estilo vive en `TablaCanales.module.css` (seccion 3) — cada capa una sola responsabilidad, ninguna conoce los detalles de las otras dos.
