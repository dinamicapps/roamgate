# Formato de Commits

## Estructura

```
tipo: descripcion breve

Cuerpo opcional con contexto adicional.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Reglas

- Usar `Co-Authored-By` cuando Claude genera o modifica codigo
- No hacer amend de commits ya publicados
- Preferir commits nuevos sobre amend
- Hacer commit solo cuando el usuario lo solicite explicitamente
- No usar `--no-verify` ni `--force` sin autorizacion explicita
