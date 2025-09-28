# Repository Guidelines

## Project Structure & Module Organization
- `backend/` contains the Node.js API. `server.js` boots the service and wires the `routes/`, `controllers/`, `models/`, and `config/` layers.
- Database schema and seed data live in `database/db_node.sql`; update it whenever models change.
- Stakeholder docs stay under `documentacionProyecto/`. Developer guides, including this file and `readme.md`, belong in the repo root.

## Build, Test, and Development Commands
- `cd backend && npm install` refreshes dependencies; run after pulling package changes.
- `cd backend && node server.js` starts the API on `process.env.PORT` (default 3000). Configure overrides through `.env` or `config/config.js`.
- `cd backend && npm test` is currently a placeholder. Replace it with a Jest + Supertest suite and keep the command wired into CI gates.

## Coding Style & Naming Conventions
- Use 2-space indentation, single quotes, and add trailing commas only when ESLint insists.
- Name files by responsibility: `userRoute.js`, `userController.js`, and models in lowerCamelCase to mirror table names.
- Centralize secrets and shared config inside `config/`; load sensitive values from environment variables via `config/keys.js`.

## Testing Guidelines
- Place tests in `backend/tests/<module>.test.js` and align filenames with their subject.
- Standardize on Jest for unit coverage and Supertest for HTTP flows; target at least 80% line coverage for controllers and passport strategies.
- Mock MySQL with `mysql2` or point to a dedicated test schema. Ensure `npm test` runs clean before raising a pull request.

## Commit & Pull Request Guidelines
- Follow Conventional Commits such as `feat(auth): add JWT refresh` or `fix(database): sync seed data`. Keep changes focused.
- When schema shifts, update `database/db_node.sql` in the same commit as related code.
- Pull requests must include a concise summary, testing evidence, linked issue or task, and screenshots or curl samples for new endpoints.

## Security & Configuration Tips
- Sanitize and validate incoming data inside controllers before issuing MySQL queries; prefer parameterized statements.
- Never commit real credentials. Document required environment keys in `backend/.env.example`, including `PORT`, `DB_*`, `JWT_*`, and `PASSWORD_RESET_TOKEN_MINUTES`.

## Proximos Pasos
- Integrar Sequelize: migraciones y modelos bajo `backend/sequelize/` para `users`, `user_refresh_tokens`, `password_reset_tokens`.
- Disenar nuevas tablas estilo Splitwise (`groups`, `group_members`, `categories`, `expenses`, `expense_shares`) y generar migraciones correspondientes.
- Implementar controladores y rutas `/categories` y `/expenses` con validaciones, filtros por fecha y verificacion de pertenencia (JWT/Passport).
- Configurar Jest + Supertest en `backend/tests/` y reemplazar el script `npm test` para automatizar los flujos clave.
- Actualizar `database/db_node.sql` para reflejar cambios en el esquema y proveer instrucciones de despliegue.
