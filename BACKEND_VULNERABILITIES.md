# Backend Vulnerabilities

Auditoría inicial (`npm audit`, antes de actualizar): **17 vulnerabilidades** (3 moderate, 13 high, 1 critical).

## Package: puppeteer
- Current version: `^21.6.1`
- Vulnerability: dependencias transitivas vulnerables — `extract-zip` (symlink path traversal, HIGH), `tar-fs` (symlink validation bypass / path traversal, 3x HIGH), `ws` (DoS por headers, memory disclosure, memory exhaustion, 3x HIGH)
- Recommended: `^25.9.0` (latest). Se probó `^23` primero (según instrucción original) pero seguía reportando 11 HIGH + 1 CRITICAL porque las versiones parcheadas de `extract-zip`/`tar-fs`/`ws` solo llegan con Puppeteer 25.x.
- Breaking changes: ninguno relevante para este proyecto. Puppeteer no se usa aún en el código fuente (`src/`); solo está declarado como dependencia para el futuro módulo de generación de PDF (Libro de Guardia) mencionado en la especificación técnica.
- Action: actualizado a `^25.9.0`. `PUPPETEER_SKIP_DOWNLOAD=true` se sigue usando en instalación para evitar la descarga de Chromium en este entorno (no se genera PDF todavía).

## Package: vitest / vite (transitivo) / esbuild (transitivo)
- Current version: `vitest@^1.1.0`
- Vulnerability: `esbuild` <=0.24.2 permite que cualquier sitio web envíe requests al dev server y lea la respuesta (MODERATE), arrastrado por `vite`/`vite-node`/`vitest`
- Recommended: `vitest@^4.1.11`
- Breaking changes: major version, pero `vitest` solo se usa como test runner (`npm run test`), no hay tests unitarios implementados aún que dependan de APIs removidas.
- Action: actualizado a `^4.1.11`.

## Package: @typescript-eslint/parser, @typescript-eslint/eslint-plugin
- Current version: `^6.17.0`
- Vulnerability: dependían de `minimatch` 9.0.0-9.0.6 (ReDoS, HIGH, 3 CVEs)
- Recommended: `^8.68.0`
- Breaking changes: v8 activa `no-explicit-any` como `error` por defecto (antes era `warn`/no incluido). El código usa `any` deliberadamente en las interfaces de repositorio (`IPersonaRepository`, etc., patrón Clean Architecture con Prisma). Se bajó la regla a `warn` en `.eslintrc.json` para no forzar un refactor de arquitectura fuera del alcance de esta tarea.
- Action: actualizado a `^8.68.0`. Verificado con `npm run lint` (0 errores, solo warnings preexistentes de estilo).

## Package: uuid
- Current version: `^9.0.1`
- Vulnerability: missing buffer bounds check en v3/v5/v6 cuando se provee un `buf` (MODERATE)
- Recommended: `^14.0.2`
- Breaking changes: ninguno para este proyecto — el paquete `uuid` no se usa en el código fuente (`src/`); Prisma genera los UUID vía la función `uuid()` del propio esquema/PostgreSQL, no vía este paquete JS.
- Action: actualizado a `^14.0.2`.

## Correcciones de lint no relacionadas a las vulnerabilidades

Durante la verificación (`npm run lint`) tras actualizar `@typescript-eslint`, aparecieron errores preexistentes no causados por esta tarea:
- `.eslintrc.json` tenía el nombre de regla mal escrito `explicit-function-return-types` (con "s" al final; el nombre real es `explicit-function-return-type`), por lo que nunca se aplicaba. Corregido.
- Variables `catch (error)` sin usar en `authMiddleware.ts` y `TokenService.ts`, y `next` sin usar en `errorHandler.ts`: renombradas con prefijo `_` conforme al patrón `argsIgnorePattern`/`caughtErrorsIgnorePattern` ya definido en la config.
- `declare global { namespace Express {...} }` en `authMiddleware.ts` (patrón estándar de Express para extender tipos de `Request`): se excluyó puntualmente de `no-namespace` con un comentario `eslint-disable-next-line`.

## Resultado final

```
npm audit
found 0 vulnerabilities
```
