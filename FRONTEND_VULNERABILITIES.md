# Frontend Vulnerabilities

Auditoría inicial (`npm audit`, antes de actualizar): **10 vulnerabilidades** (3 moderate, 7 high).

## Package: react-router-dom (+ react-router transitivo)
- Current version: `^6.20.0`
- Vulnerability: open redirect vía backslash en `<Link>`/`useNavigate` (CVE-2025-68470 bypass, MODERATE) + arbitrary constructor injection vía `deserializeErrors()` en SSR hydration (MODERATE)
- Recommended: `^7.18.2` (latest)
- Breaking changes: React Router v7 renombra algunas exportaciones internas y cambia el modelo de data loading, pero la API usada en este proyecto (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `Link`, `useNavigate`, `useLocation`) sigue disponible sin cambios. No usamos SSR ni loaders, por lo que el impacto de ambas vulnerabilidades era además bajo en este contexto (rutas simples y fijas: `/login`, `/access`, `/dashboard`).
- Action: actualizado a `^7.18.2`. Verificado con `npm run type-check` y `npm run build` sin errores.

## Package: @typescript-eslint/parser, @typescript-eslint/eslint-plugin
- Current version: `^6.10.0`
- Vulnerability: dependían de `minimatch` 9.0.0-9.0.6 (ReDoS, HIGH)
- Recommended: `^8.68.0`
- Breaking changes: mismo caso que el backend — v8 sube `no-explicit-any` a `error` por defecto. El código usa `error: any` en bloques `catch` de formularios (`LoginPage.tsx`, `FormPresente.tsx`, `FormVisita.tsx`) para leer `error.response?.data?.message` de Axios. Se bajó la regla a `warn` para no forzar un refactor de tipado de errores fuera del alcance de esta tarea.
- Action: actualizado a `^8.68.0`.

## Package: vite, esbuild (transitivo), @vitejs/plugin-react
- Current version: `vite@^5.0.8`
- Vulnerability: `esbuild` <=0.24.2 permite que cualquier sitio web envíe requests al dev server y lea la respuesta (MODERATE)
- Recommended: `vite@^8.2.2`, `@vitejs/plugin-react@^6.1.0` (requerido como peer dependency de Vite 8)
- Breaking changes: Vite 8 cambia el default del config loader. `vite.config.ts` usaba `__dirname` (CommonJS), que generaba un warning bajo el nuevo `configLoader: 'native'`; se migró a `import.meta.dirname` (estándar ESM, recomendado por Vite). No hubo cambios de comportamiento en el proxy `/api` ni en el puerto de dev server.
- Action: actualizado a `vite@^8.2.2` + `@vitejs/plugin-react@^6.1.0`. Verificado con `npm run build` (build de producción exitoso, 0 warnings) y `npm run dev` (arranca en :5173 sin errores).

## Resto de dependencias

`npm update` general aplicado sobre el resto de dependencias no vulnerables (react, axios, zod, react-hook-form, etc.) para mantenerlas en el rango semver más reciente compatible. No se detectaron regresiones en `type-check` ni `build`.

## Correcciones no relacionadas a las vulnerabilidades

- `vite.config.ts`: `__dirname` reemplazado por `import.meta.dirname` (ver arriba).
- `.eslintrc.json`: `no-explicit-any` agregado explícitamente como `warn` (ver arriba).

## Resultado final

```
npm audit
found 0 vulnerabilities
```
