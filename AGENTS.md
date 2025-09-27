# Repository Guidelines

## Project Structure & Module Organization
- `backend/` contains the Node.js API: `server.js` entrypoint, `routes/`, `controllers/`, `models/`, and `config/` for database/passport wiring.
- `database/db_node.sql` stores schema and seed data; update alongside model changes.
- `documentacionProyecto/` hosts stakeholder-facing docs. Keep developer-centric guides in this repo root (`AGENTS.md`, `readme.md`).

## Build, Test, and Development Commands
- `cd backend && npm install` installs dependencies. Run after pulling package updates.
- `cd backend && node server.js` boots the API on `process.env.PORT` (default 3000); adjust `.env` o `config/config.js` for host overrides.
- `cd backend && npm test` actualmente es un placeholder. Sustitúyelo por Jest + supertest antes de fusionar cambios relevantes.

## Coding Style & Naming Conventions
- Prefer 2-space indentation, single quotes, and trailing commas only where ESLint requires them.
- Name route files `resourceRoute.js`, controllers `resourceController.js`, and models in lowerCamelCase to mirror table names.
- Keep shared config in `config/` and avoid hard-coded secrets; load sensitive keys via environment variables inside `config/keys.js`.

## Testing Guidelines
- Place unit and integration tests under `backend/tests/<module>.test.js`, matching the controller/model being exercised.
- Use Jest for unit coverage and Supertest for HTTP flows; aim for >=80% line coverage on controllers and `passport` strategies.
- Gate merges on `npm test` passing and include fixtures for database-dependent suites (mock MySQL with `mysql2` or configure a test schema).

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `docs:`); scope optional but encouraged (`feat(auth): add JWT refresh`).
- Keep commits focused; update `db_node.sql` and code in the same commit when schema changes are required.
- Pull requests need: summary, testing notes, linked issue or task, and screenshots or curl examples for new endpoints.

## Security & Configuration Tips
- Sanitize user input in controllers before touching `mysql` queries; prefer parameterized statements.
- Never commit real credentials; usa `backend/.env.example` para documentar claves (`PORT`, `DB_*`, `JWT_*`, `PASSWORD_RESET_TOKEN_MINUTES`).
