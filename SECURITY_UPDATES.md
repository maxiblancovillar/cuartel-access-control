# Security Updates - Agosto 2026

## Changes Made

### Backend

- Updated puppeteer from `^21.6.1` to `^25.9.0`
  - Reason: cerrar HIGH/CRITICAL en `extract-zip`, `tar-fs`, `ws` (dependencias transitivas). La versión `^23` sugerida originalmente no era suficiente: seguía reportando 11 HIGH + 1 CRITICAL, ya que las versiones parcheadas de esas dependencias solo llegan con Puppeteer 25.x.
  - Breaking changes: ninguno relevante (Puppeteer no se usa aún en código fuente, solo declarado para el futuro módulo PDF).

- Updated vitest from `^1.1.0` to `^4.1.11`
  - Reason: cerrar vulnerabilidad CRITICAL en la cadena `esbuild` → `vite` → `vite-node` → `vitest`.

- Updated @typescript-eslint/parser y @typescript-eslint/eslint-plugin de `^6.17.0` a `^8.68.0`
  - Reason: cerrar HIGH por `minimatch` vulnerable (ReDoS).
  - Nota: v8 activa `no-explicit-any` como error por defecto; se bajó a `warn` en `.eslintrc.json` para no forzar un refactor del patrón `any` usado en las interfaces de repositorio.

- Updated uuid de `^9.0.1` a `^14.0.2`
  - Reason: cerrar MODERATE (missing buffer bounds check). No usado en código fuente, bajo riesgo.

- Corregidos bugs preexistentes de lint (no relacionados a las vulnerabilidades, encontrados al re-ejecutar `npm run lint` tras la actualización):
  - Nombre de regla mal escrito en `.eslintrc.json` (`explicit-function-return-types` → `explicit-function-return-type`).
  - Variables `catch (error)` / `next` sin usar, renombradas con prefijo `_`.
  - Namespace de Express excluido puntualmente de `no-namespace` (patrón estándar de tipado).

### Frontend

- Updated react-router-dom de `^6.20.0` a `^7.18.2`
  - Reason: cerrar open redirect vía backslash + arbitrary constructor injection en SSR hydration (ambas MODERATE). Impacto real bajo en esta app (rutas fijas, sin SSR), pero se actualiza igual.
  - Breaking changes: ninguno para la API usada (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `Link`, `useNavigate`, `useLocation`).

- Updated vite de `^5.0.8` a `^8.2.2`, y `@vitejs/plugin-react` de `^4.2.0` a `^6.1.0` (peer dependency requerida por Vite 8)
  - Reason: cerrar MODERATE en `esbuild` transitivo.
  - Breaking changes: Vite 8 cambia el config loader por defecto. Se migró `vite.config.ts` de `__dirname` (CommonJS) a `import.meta.dirname` (ESM) para eliminar un warning de build.

- Updated @typescript-eslint/parser y @typescript-eslint/eslint-plugin de `^6.10.0` a `^8.68.0`
  - Reason: mismo motivo que el backend (minimatch ReDoS). Misma nota sobre `no-explicit-any` bajado a `warn` (usado en manejo de errores de Axios en formularios).

- `npm update` general sobre el resto de dependencias no vulnerables, sin regresiones detectadas.

## Verification

- Backend `npm audit`: **0 vulnerabilities** (antes: 17 — 3 moderate, 13 high, 1 critical)
- Frontend `npm audit`: **0 vulnerabilities** (antes: 10 — 3 moderate, 7 high)
- Backend `npm run build`: sin errores
- Backend `npm run lint`: 0 errores (79 warnings preexistentes de estilo, no bloqueantes)
- Backend `npx prisma generate`: OK
- Frontend `npm run type-check`: sin errores
- Frontend `npm run build`: sin errores ni warnings
- Frontend `npm run lint`: 0 errores (3 warnings preexistentes por `any` en manejo de errores)
- Testing E2E real con ambos servicios levantados (Docker Postgres + backend `npm run dev` + frontend `npm run dev`):
  - `GET /health` → `{"status":"ok"}`
  - `POST /auth/login` con `guardia_001` (OPERADOR) y `supervisor_001` (SUPERVISOR) → JWT válido
  - `GET /dashboard/situacion-actual` con token de SUPERVISOR → 200 OK con KPIs reales
  - `GET /units/tree` con token de OPERADOR → 200 OK
  - Frontend en `http://localhost:5173` → 200 OK
  - Proxy Vite `/api` → backend `:3000` → funcionando (login vía proxy verificado)
- No breaking changes de funcionalidad: mismos endpoints, mismos contratos de request/response, mismas credenciales de prueba.

## Files Changed

```
backend/package.json
backend/package-lock.json
backend/.eslintrc.json
backend/src/api/middlewares/errorHandler.ts
backend/src/api/middlewares/authMiddleware.ts
backend/src/application/services/TokenService.ts
frontend/package.json
frontend/package-lock.json
frontend/.eslintrc.json
frontend/vite.config.ts
BACKEND_VULNERABILITIES.md (nuevo)
FRONTEND_VULNERABILITIES.md (nuevo)
SECURITY_UPDATES.md (nuevo)
```

## Commit Message

```
fix(security): update dependencies to close vulnerabilities

- Updated puppeteer v21 -> v25.9.0 (fixes HIGH/CRITICAL in extract-zip, tar-fs, ws)
- Updated react-router-dom v6 -> v7.18.2 (fixes open redirect)
- Updated vite v5 -> v8.2.2 and @vitejs/plugin-react (fixes esbuild MODERATE)
- Updated vitest v1 -> v4.1.11 (fixes CRITICAL in vite chain)
- Updated @typescript-eslint/* v6 -> v8.68.0 in backend and frontend (fixes minimatch ReDoS)
- Updated uuid v9 -> v14.0.2 in backend (fixes buffer bounds check MODERATE)
- Fixed pre-existing lint config bugs found during verification
- npm audit: 0 HIGH/CRITICAL/MODERATE in both backend and frontend
- All services verified working end-to-end (login, dashboard, units)
```
