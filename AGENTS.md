# Wago.io agent guide

## Purpose

This repository contains the current Wago v3 web application. Make small, focused changes. Preserve current behavior unless the task requires a behavior change. Do not start a broad framework migration as part of an unrelated task.

## Start each task

1. Read this file and the files that you will change.
2. Read one nearby implementation that does similar work.
3. Check `git status --short` and keep unrelated user changes intact.
4. Identify all affected parts of the system. The backend imports some frontend files directly.
5. State any validation limit. This project does not have one reliable repository-wide test command.

## Runtime and package layout

- Use Node.js 18.20.4. Both application packages pin this version with Volta, and the development container uses Node.js 18.
- Use npm and the package lockfile in each directory. There is no root package or workspace.
- Run package commands from the package directory that owns the lockfile.
- `backend/` is the Fastify 3 API, background worker, and data layer.
- `frontend/` is the Vue 2 single-page application and Webpack 5 build.
- `scripts/` contains operational scripts with their own dependencies and lockfile.
- If you add Python tooling, use `uv`.

Install only the dependencies that a task needs:

```sh
(cd backend && npm ci)
(cd frontend && npm ci)
(cd scripts && npm ci) # Only for a scripts/ task.
```

Do not run npm from the repository root. Update only the lockfile that belongs to the changed package.

## Architecture map

### Backend

- `backend/server.js` is the composition root. It generates and serves the OpenAPI contract, creates Fastify, connects Redis and MongoDB, registers global hooks and route plug-ins, loads models and import handlers, and starts BullMQ workers and repeat jobs.
- Run backend processes with `backend/` as the current directory. Several modules use paths such as `./api/models` and `./api/lua/wago.lua`.
- `backend/api/services/` contains Fastify route plug-ins. Existing plug-ins use the Fastify 3 callback form and call `next()` after route registration.
- `backend/middlewares/` contains global request hooks. Their registration order in `server.js` is part of request behavior.
- `backend/api/models/` contains Mongoose 5 models.
- `backend/api/helpers/` contains search, import, Lua, image, integration, and background-task logic.
- `backend/api/helpers/encode-decode/` contains the auto-loaded import adapters. Follow its `Readme.md` and a current adapter when you add an import type.
- `backend/tools/generate-openapi.js` is the source for the WeakAuras API contract used by Wago App. It writes the tracked `public/openapi.json` file.
- Much of the backend depends on globals initialized by `server.js`, including models, Redis clients, queues, configuration, categories, and import adapters. Do not assume that a module is safe to load in isolation.

### Frontend

- `frontend/src/main.js` is the browser composition root. It owns Vuex state, router hooks, HTTP behavior, authentication headers, sockets, i18n, global components, and application startup.
- `frontend/src/router.js` is the route table. It uses lazy-loaded Vue 2 components. Keep the `/:wagoID` catch-all routes last.
- `frontend/src/components/core/` contains feature and page components.
- `frontend/src/components/UI/` contains shared UI components.
- `frontend/src/components/libs/` contains shared registries and browser-side helpers.
- Use Vue 2 Options API and the existing Vuex, Vue Router 3, and global plug-in patterns. Do not introduce Vue 3 or Composition API patterns without an explicit migration task.
- The development frontend uses `http://localhost:3030` for the API and `ws://localhost:3030/ws` for sockets. Webpack serves the frontend on port 8080.

### Cross-application seams

Treat these frontend files as shared backend modules:

- `frontend/src/components/libs/categories2.js` is the main category registry used by both applications and several import and task helpers.
- `frontend/src/components/libs/categories.js` is still used by `backend/ProcessCategoryRelevancy.js`. Treat that standalone process as a separate compatibility path.
- `frontend/src/components/libs/addons.js` initializes category and add-on data in both applications.
- `frontend/src/router.js` is loaded by `backend/api/services/wago.js`. Top-level frontend routes also reserve custom Wago slugs.
- `i18nLocaleConfig.js` and `frontend/static/i18n/` are used by both applications.

When you change a route, add-on, category, expansion, domain, or translation key, search for its use in both `backend/` and `frontend/`. A frontend-only diff can still change backend behavior.

## Local configuration and external effects

- `backend/config.js` is ignored and can contain secrets. Never commit it or print secret values.
- `backend/config.js.sample` is a starting reference, not proof of a complete working configuration. The backend also needs MongoDB, Redis, search services, LuaJIT, and task-specific external credentials.
- A development backend is not read-only. Startup can create or remove repeat jobs, update search indexes, start workers, and call external services. Use isolated local services and safe credentials.
- Backend startup rewrites `public/openapi.json` from `backend/tools/generate-openapi.js` before it listens. Review this generated-file change if you start the server after an API edit.
- `scripts/updateWoWTerms.js` changes tracked locale data and can purge Cloudflare cache. Run it only when the task explicitly requires those effects and the required environment is understood.
- Import strings, uploaded files, URLs, webhook data, and rendered text are untrusted input. Preserve validation and authorization checks. Escape data before it enters Lua, HTML, a shell, a query, or an outbound request.
- Authentication middleware adds request state, but each protected route must still enforce its own authorization rule.
- Use the 1Password integration when work requires a 1Password developer environment. Do not copy credentials into source files or chat output.

## Code conventions

- Match the local file before you change style. Backend and shared modules use CommonJS. Frontend entry files and Vue components use ES module imports. Most files use two spaces, Standard-style JavaScript, and few semicolons.
- Frontend lint rules are in `frontend/.eslintrc.js`. The configured brace style is Stroustrup.
- Keep CommonJS in backend and shared modules unless an explicit migration changes the whole loading path.
- Do not mass-format old files. Keep diffs limited to the requested change.
- Reuse existing helpers, request objects, model methods, and global services before you add a new abstraction.
- Do not add a dependency when the installed platform or a small local helper is sufficient. If a dependency is necessary, explain why and update the correct package lockfile.
- Add tests at a public behavior seam when practical. Do not add tests that only restate the implementation.
- Use Simplified Technical English in documentation and user-facing explanations.

## Commands and validation

### Frontend

```sh
(cd frontend && npm run dev)
(cd frontend && npm run build)
(cd frontend && npx --no-install eslint src/main.js src/router.js path/to/changed.vue)
```

Pass only changed JavaScript and Vue files to ESLint when practical. Replace the example paths with the files that you changed.

`npm run build` runs the i18next scanner before Webpack. Review changes under `frontend/static/i18n/en-US/` and keep only intentional translation changes.

### Backend

```sh
(cd backend && node --check path/to/changed.js)
(cd backend && npm run openapi:check)
(cd backend && node server.js)
```

Start the backend only after you have a safe local configuration and its required services. For route work, also exercise the affected endpoint against an isolated local instance when possible.

When a documented WeakAuras API contract changes, edit `backend/tools/generate-openapi.js`, then update and check the generated file:

```sh
(cd backend && npm run openapi)
(cd backend && npm run openapi:check)
```

The OpenAPI generator uses only Node.js built-in modules. You can run its check without installing backend dependencies.

The backend `npm run dev` script requires `forever`, but `forever` is not declared in the backend package. Do not assume that command is available.

### Test limitations

- `backend/package.json` has a placeholder `npm test` command that always fails. Do not report it as a project test failure.
- `backend/unitTests.js` is a stateful integration script. It requires a running configured backend and writes an expiring import to the configured database. Run it only against disposable or approved data:

```sh
(cd backend && node unitTests.js)
```

- The files under `frontend/test/` are old scaffold tests. They reference deleted components and missing build configuration, and no frontend test script calls them. Do not report them as working coverage.
- The GitHub Actions workflow in `.github/workflows/openapi.yml` checks only OpenAPI contract drift. It is not an application test suite. Select other validation from the changed behavior: syntax checks for backend files, ESLint for frontend files, the frontend production build, a focused local endpoint check, or a focused browser check.
- Always run `git diff --check` after edits.

## Common change impact

- New or changed frontend route: check `frontend/src/router.js`, the target component, and reserved-slug behavior in `backend/api/services/wago.js`.
- New supported add-on: check `frontend/src/components/libs/addons.js`, `frontend/src/components/libs/categories2.js`, `backend/api/helpers/wowAddons.js`, any import adapter, translation keys, and menu assets.
- New import format: check scan, submit, update, and reprocess paths. Use `backend/api/helpers/encode-decode/Readme.md` as the contract.
- New category or game version: check shared category data, add-on expansion lists, API category output, search filters, imports, and all required locale files.
- Public WeakAuras API change: check the route behavior, Wago App compatibility, `backend/tools/generate-openapi.js`, the generated `public/openapi.json`, and the OpenAPI drift check.
- Other API or authentication change: check global middleware order, route-level authorization, frontend HTTP helpers, cookie or token behavior, CORS, and rate limits.
- Background-task change: check all task producers, the switch in `backend/api/helpers/tasks.js`, worker environment gates, retry or repeat behavior, and whether the task calls an external service.

## Finish each task

1. Inspect the complete diff and remove unrelated edits.
2. Run the strongest safe validation for each changed subsystem.
3. Check `git diff --check` and `git status --short`.
4. Report what was validated and what could not be validated.
5. Use a conventional commit message when a commit is requested. Do not add `[codex]` to pull request titles.
