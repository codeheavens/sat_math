# SAT Math Practice

An Android-first Expo app for practicing original Digital SAT-style math questions, reviewing answers, and saving practice progress on the device.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sat-math-practice/app/` — home, topic, timed practice, and results screens
- `artifacts/sat-math-practice/data/questions.json` — editable source of the original question bank
- `artifacts/sat-math-practice/src/context/PracticeContext.tsx` — active session, language, and local score persistence
- `artifacts/sat-math-practice/constants/colors.ts` — mobile app color tokens

## Architecture decisions

- Practice questions and answer explanations are maintained locally in JSON so the bank can grow without a server.
- Active progress, language selection, and past scores are stored on the device with AsyncStorage.
- Test mode uses two 15-question modules with a separate 35-minute timer for each; topic practice is untimed.
- Results show raw practice accuracy rather than implying an official SAT scaled score.

## Product

Students can complete a timed practice test or choose a math topic, eliminate choices, flag questions, use an in-app calculator and formula reference, and review their answers and explanations. English and Arabic interface labels are available. The app uses original questions and is not affiliated with College Board.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
