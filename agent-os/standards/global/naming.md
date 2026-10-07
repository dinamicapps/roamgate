# Nomenclatura General

## Idioma

- Codigo fuente en espanol: variables, metodos, clases, comentarios
- Documentacion tecnica en espanol
- Commits en espanol con formato convencional

## Commits

Formato: `tipo: descripcion breve en espanol`

Tipos validos:
- `feat:` nueva funcionalidad
- `fix:` correccion de bug
- `refactor:` reestructuracion sin cambio funcional
- `docs:` documentacion
- `test:` pruebas
- `chore:` mantenimiento

```
feat: agregar filtro de busqueda por fecha en listado de ordenes
fix: corregir calculo de IVA cuando hay descuento aplicado
```

- Primera letra minuscula despues del tipo
- Sin punto final
- Maximo 72 caracteres en primera linea

## Ramas Git

- Rama principal: `dev`
- Formato: `tipo/nombre-descriptivo`

```
feature/gestion-usuarios-empresa
fix/calculo-iva-descuento
refactor/pipeline-prompts-ia
```
