# Doctrina de capas: frontend (perfil dotnet-angularjs)

<!-- FUENTE: agent-os/doctrina/global/principios-ingenieria.md seccion "Los anti-patrones canonicos". El vocabulario (DRY, acoplamiento, cohesion) y la definicion general del God Component viven alli. Este archivo solo aterriza el remedio concreto para el perfil dotnet-angularjs (AngularJS + vistas MVC clasicas + modulos vanilla JS/TS). NO duplicar la regla -- para modificar el vocabulario, editar la fuente. -->

Aplica al codigo **nuevo** en el frontend del perfil dotnet-angularjs, en sus dos variantes: vistas AngularJS sobre MVC clasico (`.cshtml` + `ng-controller`) y modulos vanilla JS/TS (paginas o dashboards generados sin framework). Codigo existente tocado sigue el arbol de decision de la doctrina de expertos (guia+hallazgo sin garantia de prueba; sugerencia de refactor con garantia de prueba) -- este archivo no fuerza refactor de legacy, define el objetivo cuando se construye o se refactoriza.

Precedencia: si el repo consumidor tiene un standard propio en `agent-os/standards/` que cubre lo mismo, ese gana sobre esta doctrina del sistema. <!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md seccion "Doctrina del sistema vs standard del consumidor". Regla completa de precedencia alli. NO duplicar. -->

## Las 3 capas minimas

Traduccion del Eje A (estructura/presentacion/comportamiento del documento web) y el Eje B (capas de una app cliente) al idioma AngularJS + vanilla JS/TS del perfil dotnet-angularjs.

### 1. Conectividad/HTTP + DTOs -- factory de AngularJS / modulo de datos vanilla

Todo `$http`/`fetch` pasa por una capa de datos. Un controller de AngularJS **nunca llama `$http` directo**; llama a una factory que ya sabe el endpoint, el metodo HTTP y la forma de la respuesta. Un modulo vanilla nunca embebe `fetch` en el mismo archivo que arma el HTML.

```javascript
// AngularJS: factory dedicada al modulo, nunca $http directo desde el controller
angular.module('app').factory('indicadoresFactory', [
  '$http',
  function ($http) {
    return {
      obtenerIndicador030: function (idSede, fechaInicio, fechaFin) {
        return $http.get('/api/indicador030/obtener', {
          params: { idSede: idSede, fechaInicio: fechaInicio, fechaFin: fechaFin }
        });
      }
    };
  }
]);
```

```javascript
// Vanilla: modulo de datos separado, exporta funciones async, nada de HTML ni CSS aqui
export async function listarCanales() {
  const resp = await fetch('/api/canales/listar');
  return resp.json();
}
```

- El envelope de respuesta (`{ error, mensaje, dato }`) se resuelve en la factory/modulo de datos, no en el controller ni en el markup.
- Los DTOs (la forma de lo que entra y sale) quedan explicitos en la firma de la funcion aunque el proyecto sea JavaScript sin tipado estatico.

### 2. Logica de componentes / flujos -- controller de AngularJS / modulo de UI vanilla

Un controller de AngularJS orquesta `$scope`, llama a la factory (nunca a `$http` directo) y expone estado + acciones a la vista. Un modulo vanilla de UI llama al modulo de datos y actualiza el DOM, sin `fetch` propio.

```javascript
angular.module('app').controller('ctrlIndicador030', [
  '$scope', 'indicadoresFactory',
  function ($scope, indicadoresFactory) {
    $scope.cargando = false;
    $scope.filas = [];

    $scope.cargar = function (idSede, fechaInicio, fechaFin) {
      $scope.cargando = true;
      indicadoresFactory.obtenerIndicador030(idSede, fechaInicio, fechaFin)
        .then(function (resp) { $scope.filas = resp.data.dato; })
        .finally(function () { $scope.cargando = false; });
    };
  }
]);
```

```javascript
// Vanilla: modulo de UI, usa el modulo de datos, sin fetch ni CSS embebido
import { listarCanales } from './dashboard-canales.datos.js';

export async function renderizarTablaCanales(contenedor) {
  const canales = await listarCanales();
  contenedor.innerHTML = canales.map((c) => `<tr><td>${c.nombre}</td></tr>`).join('');
}
```

### 3. Presentacion / layout -- plantilla + CSS externo

El markup y el estilo viven en archivos propios. Nada de bloques `<style>` embebidos ni `style="..."` inline de uso general; cambiar estado visual es alternar una clase CSS, no escribir estilos desde el script.

```html
<!-- Areas/Exportacion/Views/Indicador030/Index.cshtml -->
<div ng-controller="ctrlIndicador030" class="indicador030-panel">
  <table class="tabla-indicador">
    <tr ng-repeat="fila in filas"><td>{{ fila.ind }}</td></tr>
  </table>
</div>
```

```css
/* Content/exportacion/indicador030.css */
.indicador030-panel { padding: 16px; }
.tabla-indicador { width: 100%; border-collapse: collapse; }
```

Para modulos vanilla, la funcion que arma el HTML solo produce markup (referencia clases CSS por nombre) y el CSS vive en hojas separadas -- si el repo ya tiene un design-system (tokens + kit de componentes), la plantilla lo consume en vez de reinventarlo.

## Anti-patron: God Component / archivo todo-en-uno

**Definicion:** un archivo que mezcla las tres capas -- markup, CSS embebido (`<style>` o `style="..."` inline) y logica de datos (`$http`/`fetch` inline) -- en un solo lugar. Es el equivalente frontend del Fat/God Controller: baja cohesion (el archivo hace de todo) + alto acoplamiento (cualquier cambio de estilo, de endpoint o de flujo obliga a tocar el mismo archivo). El perfil dotnet-angularjs tiene dos variantes observables del mismo olor:

**Variante AngularJS/MVC:** una vista `.cshtml` con un bloque `<style>` embebido y un `<script>` con `fetch()`/`$.ajax()` directo, mezclado en el mismo archivo con markup de AngularJS (`ng-controller`, `ng-repeat`), sin pasar por ninguna factory. El navegador ejecuta HTML, CSS y JS de negocio que deberian vivir en tres archivos distintos.

**Variante vanilla (olor real, dashboard todo-en-uno `dashboard-canales.html.ts`):** un modulo que exporta una funcion que genera el documento HTML completo (`<!DOCTYPE html>` incluido), con **~460 lineas de CSS embebidas en un bloque `<style>`** y llamadas `fetch(...)` directas dentro del `<script>` de la pagina -- **reinventando un design-system que el propio repositorio ya expone por separado** (`tokens.css` con las variables de color/espaciado y `kit.css` con los componentes reutilizables). El mismo repositorio tiene la solucion al lado y el archivo la ignora: DRY y capas rotos a la vez, observable en el propio codigo.

```javascript
// ANTES (smell): funcion todo-en-uno
export function generarHTMLCanales() {
  return `<!DOCTYPE html>
<html><head><style>
  .header { background: #24283b; padding: 12px 20px; }
  .tabla th { color: #565f89; }
  /* ...cientos de lineas mas, reinventando tokens que ya existen aparte... */
</style></head>
<body>
  <div class="header"><h1>Canales</h1></div>
  <script>
    fetch('/api/canales/listar').then(r => r.json()).then(json => { /* ...pinta la tabla... */ });
  </script>
</body></html>`;
}
```

**Sintomas generales:** un solo archivo `.html`/`.ts`/`.cshtml` de mas de 200-300 lineas que mezcla CSS embebido, `fetch`/`$.ajax` directo y markup extenso; estilos redefinidos localmente que ya existen en un design-system del propio repo; imposibilidad de reusar el markup sin arrastrar el CSS o el script.

**Remedio: HTML aparte, CSS al design-system/tokens externos, modulo de datos/fetch separado.**

```javascript
// DESPUES: dashboard-canales.html.ts -- solo markup, importa clases del design-system
export function generarHTMLCanales() {
  return `<!DOCTYPE html>
<html><head>
  <link rel="stylesheet" href="/dashboard-ds/tokens.css">
  <link rel="stylesheet" href="/dashboard-ds/kit.css">
</head>
<body>
  <div class="header"><h1>Canales</h1></div>
  <div id="tabla-canales"></div>
</body></html>`;
}
```

```javascript
// dashboard-canales.datos.ts -- fetch aislado, sin HTML ni CSS
export async function listarCanales() {
  const resp = await fetch('/api/canales/listar');
  return resp.json();
}
```

```javascript
// dashboard-canales.ui.ts -- orquesta datos + DOM, sin fetch propio ni CSS embebido
import { listarCanales } from './dashboard-canales.datos.js';

export async function pintarTablaCanales(contenedorId) {
  const canales = await listarCanales();
  document.getElementById(contenedorId).innerHTML =
    canales.map((c) => `<tr class="fila-canal"><td>${c.nombre}</td></tr>`).join('');
}
```

El HTML deja de tener CSS ni fetch propios (consume `tokens.css`/`kit.css` del design-system existente), el fetch vive en el modulo de datos, y la orquestacion DOM vive en el modulo de UI -- cada capa una sola responsabilidad, ninguna conoce los detalles de las otras dos. La variante AngularJS resuelve el mismo olor con las capas de la seccion 1-3 arriba: factory para el `$http`, controller para el flujo, vista + CSS externo para la presentacion.
