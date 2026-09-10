# gym-buddy-front — Agent Guide

## Stack

- **Vite 8** + **React 19** + **TypeScript ~6** (project references: `tsconfig.app.json` + `tsconfig.node.json`)
- **Package manager**: Bun (`bun.lock` present — use `bun`, not `npm`/`yarn`/`pnpm`)

## Commands

| Action | Command |
| --- | --- |
| Dev server | `bun dev` |
| Build | `bun build` (runs `tsc -b` then `vite build`) |
| Lint | `bun lint` |
| Preview build | `bun preview` |

**No test framework is configured yet.** Do not run or write tests until one is added.

## React Compiler

Enabled via **Babel** (`babel-plugin-react-compiler` through `@rolldown/plugin-babel`), not the native Vite plugin. The preset is imported from `@vitejs/plugin-react` as `reactCompilerPreset`. See `vite.config.ts`.

## TypeScript Gotchas

- `verbatimModuleSyntax` is on — use explicit `import type` / `export type`. Bare `import` for values only.
- `erasableSyntaxOnly` — no runtime `enum`, `namespace`, or TS-only constructs.
- `noUnusedLocals` and `noUnusedParameters` are strict errors.
- `allowImportingTsExtensions` is true — imports may include `.tsx`/`.ts` extensions.

## Linting

- **oxlint** only (`bun lint`). Config in `.oxlintrc.json`.
- Currently basic (no type-aware rules). Rules of Hooks is the only error-level rule.

## Review Config

- `.gga` configures Gentle AI review for `*.ts,*.tsx,*.js,*.jsx`, excluding test/spec/d.ts files.
- `AGENTS.md` is the designated rules file for review.

## Architecture (current)

Scaffold only. Entry: `src/main.tsx` → `<App>` → `src/App.tsx`. Styles: CSS modules in `index.css` + `App.css`. Assets in `src/assets/`. No routing, state management, or API layer yet.
