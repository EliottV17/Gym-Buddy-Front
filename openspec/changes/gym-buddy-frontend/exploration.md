# Exploration — gym-buddy-frontend

**Phase**: sdd-explore
**Date**: 2026-09-05
**Store**: hybrid (openspec + engram)

---

## Current State

`gym-buddy-front` is a pure Vite 8 + React 19 + TypeScript ~6 scaffold:
`src/main.tsx` → `<App>` → `src/App.tsx` (Vite demo page). No routing, no state
management, no API layer, no tests. React Compiler is enabled via
`@rolldown/plugin-babel` + `reactCompilerPreset` (so manual memoization is
unnecessary and discouraged). Package manager is Bun; lint is oxlint only;
`verbatimModuleSyntax`, `erasableSyntaxOnly`, and strict unused checks are on.

The sibling `gym-buddy-api` (NestJS + TypeORM + PostGIS) is feature-complete
and running on port 3000 with global prefix `/api/v1`.

### Verified API Contract (from backend source — corrects the session context)

> The context summary provided for this change differed from the actual backend
> code in several places. The contract below is source-verified and MUST be the
> basis for frontend types and calls.

**Auth** (no guard, returns JSON):
- `POST /api/v1/auth/register` — body `{ firstName, lastName, email, password }`
  → returns the raw `User` entity (⚠ includes `passwordHash` — see Risks)
- `POST /api/v1/auth/login` — body `{ email, password }`
  → `{ token: string, user: { email: string } }`; JWT `expiresIn: '1d'`, no refresh endpoint

**Profile** (Bearer):
- `GET /api/v1/profile/me` → `User` entity (⚠ includes `passwordHash`)
- `PATCH /api/v1/profile/me` — body `UpdateProfileDto`:
  `{ activity?, experienceLevel?, availability?, latitude?, longitude?, gymName?, disciplines?, bio?, photos?, searchDistanceKm? }`
  — note **flat `latitude`/`longitude`** on write; backend converts to GeoPoint internally
- `GET /api/v1/profile/suggestions?page=1&limit=20` → `User[]` (limit clamped to 1..20;
  ordered by PostGIS distance ASC when the caller has a location, else `created_at DESC`)

**Swipes** (Bearer):
- `POST /api/v1/swipes` — body `{ swipedId: string (UUID), action: 'LIKE' | 'PASS' }`
  → `{ swipe: Swipe, matched: boolean }`; 400 on self-swipe, 409 on duplicate

**Matches** (Bearer):
- `GET /api/v1/matches` → `MatchResponse[]`
- `GET /api/v1/matches/:id` → `MatchResponse` (404 if not owned — IDOR-protected)
- `MatchResponse` = `{ id, createdAt: Date, partner: { id, firstName, activity: string|null, experienceLevel: string|null, location: GeoPoint|null } }`
  — partner is **id/firstName/activity/experienceLevel/location only** (NOT gymName/disciplines/bio/photos as previously stated)

**Messages** (Bearer):
- `GET /api/v1/matches/:matchId/messages` → `MessageResponse[]` (ASC, max 50)
- `POST /api/v1/matches/:matchId/messages` — body `{ content }` (max 1000) → `MessageResponse`
- `MessageResponse` = `{ id, content, createdAt: Date, sender: { id, firstName } }`
  — field is **`createdAt`**, not `sentAt`

**Shared types**:
- `GeoPoint` = `{ type: 'Point', coordinates: [number, number] }` (GeoJSON — `[longitude, latitude]`; read-side only)
- Enums: `SwipeAction` LIKE|PASS; `Activity` CROSSFIT|CALISTENIA|GYM|RUNNING|YOGA;
  `ExperienceLevel` BEGINNER|INTERMEDIATE|ADVANCED; `Availability` MORNING|AFTERNOON|EVENING
- Auth header: `Authorization: Bearer <token>`; errors are NestJS `{ message, statusCode, error }`
- **CORS is NOT enabled** on the backend (no `app.enableCors()`)

---

## Page / Screen Inventory

| Route | Screen | API calls | Auth |
| --- | --- | --- | --- |
| `/login` | Login form | `POST /auth/login` | public |
| `/register` | Register form | `POST /auth/register` (+ login after) | public |
| `/discover` (default post-login) | Swipe queue | `GET /profile/suggestions`, `POST /swipes` | private |
| `/profile` | View + edit own profile | `GET /profile/me`, `PATCH /profile/me` | private |
| `/matches` | Matches list | `GET /matches` | private |
| `/matches/:matchId` | Chat thread | `GET/POST /matches/:matchId/messages` | private |
| `/` | Redirect → `/discover` or `/login` | — | — |

## Decision 1 — Routing

**Recommendation: react-router (declarative `<BrowserRouter>` mode).**

| Approach | Pros | Cons | Effort |
| --- | --- | --- | --- |
| react-router | Standard, tiny API surface for 6 routes, `useNavigate`/`useParams`/`Outlet`, battle-tested with React 19 | Type-safe route params require extra typing | Low |
| TanStack Router | Fully typed routes/links | More concepts + file-convention baggage than an MVP needs | Medium |
| Hand-rolled state routing | Zero deps | URL/back-button/deep-link all broken; you rebuild a router badly | High |

`<Route element={<ProtectedRoute/>}>` wrapper reading auth state covers all private
screens in one place. A `<Navigate>` in `/` handles the default landing.

## Decision 2 — State Management

**Recommendation: TanStack Query for all server state + one small React Context (`AuthProvider`) for auth. No Zustand/Redux.**

| Approach | Pros | Cons | Effort |
| --- | --- | --- | --- |
| TanStack Query + Auth context | Query owns caching/loading/errors/pagination/invalidation (swipe → refetch suggestions, message → refetch chat); auth is the only shared client state | One new dependency | Low |
| Context-only (hand-rolled fetching) | Zero deps | ~200 lines of `useEffect` fetch + loading/error plumbing per screen; no caching, no invalidation | Medium |
| Zustand for everything | Tiny and ergonomic | Duplicates what Query already does for server state; auth alone doesn't justify a store | Low |

Server state dominates this app (suggestions, matches, messages). Query's
`refetchInterval`, `invalidateQueries`, and per-query loading/error states are
exactly what the swipe/chat flows need. The only genuinely shared client state
is `{ token, user }` — that's a Context, not a store.

## Decision 3 — API Layer

**Recommendation: thin `fetch` wrapper module, no axios. `ApiError` carrying status + NestJS message. Vite dev proxy to dodge CORS.**

- `api/client.ts`: base URL from `import.meta.env.VITE_API_URL ?? ''` (relative → proxy),
  injects `Authorization: Bearer` from a token getter, parses JSON, throws
  `ApiError(status, message)` on non-2xx (NestJS error bodies are `{ message, statusCode, error }`).
- One global 401 handler: clear auth state + redirect to `/login`.
- Vite config `server.proxy: { '/api': 'http://localhost:3000' }` — the backend has **no CORS**,
  so dev traffic must go through the proxy instead of hitting `localhost:3000` cross-origin.

| Approach | Pros | Cons | Effort |
| --- | --- | --- | --- |
| fetch wrapper + Query | Zero extra deps, modern browsers, error normalization in ~40 lines | You write the wrapper once | Low |
| axios | Interceptors baked in | Another dep for what 40 lines of fetch do at this scale | Low |
| OpenAPI codegen (orval/openapi-typescript) | Type generation from the spec | Backend has no Swagger decorators — requires backend work first | Medium |

## Decision 4 — Type Safety

**Recommendation: hand-mirrored types in `src/api/types.ts`, header comment warning they must stay in sync with `gym-buddy-api`. No codegen, no shared package for the MVP.**

| Approach | Pros | Cons | Effort |
| --- | --- | --- | --- |
| Hand-mirrored types | Zero tooling, works today, mirrors the *actual* contract | Drift risk while backend evolves | Low |
| Shared Bun workspace package (`packages/contracts`) | True single source of truth | Restructuring two repos + workspace wiring, overkill pre-stable API | High |
| OpenAPI codegen | Generated, drift-free | Backend lacks `@nestjs/swagger` — blocked on backend changes | Medium |

Frontend types: `UserView` (entity minus `passwordHash`/`createdAt` noise), `LoginResponse`,
`MatchResponse`, `MessageResponse`, `GeoPoint`, and string-literal union types for the four
enums (no TS `enum` — `erasableSyntaxOnly` forbids runtime enums).

## Decision 5 — Component Structure

**Recommendation: feature-based folders + flat `components/ui/` shared layer. Skip formal atomic design.**

```
src/
  api/
    client.ts        # fetch wrapper, ApiError, token getter
    types.ts         # backend mirror types + enum unions
    auth.ts          # login/register (+ hooks)
    profile.ts       # getProfile, updateProfile, getSuggestions (+ hooks)
    swipes.ts        # createSwipe (+ hook, exposes matched flag)
    matches.ts       # listMatches, getMatch (+ hooks)
    messages.ts      # listMessages, sendMessage (+ useMessages with polling)
  auth/
    AuthContext.tsx  # AuthProvider + useAuth (token, user, login, register, logout)
    ProtectedRoute.tsx
  components/ui/     # Button, Input, Card, Badge, Avatar, Spinner (CSS modules)
  features/
    auth/            # LoginPage, RegisterPage
    discovery/       # DiscoveryPage, SuggestionCard
    profile/         # ProfilePage, ProfileForm (lat/lng inputs)
    matches/         # MatchesPage, MatchCard
    chat/            # ChatPage, MessageList, MessageInput
  App.tsx            # providers + route table
```

Query hooks colocated with their API module (one file per domain: `profile.ts` exports
`useProfile()` next to `updateProfile()`). Atomic design's atoms/molecules/organisms
taxonomy adds ceremony with zero payoff at ~20 components. React Compiler is on — no
hand-written `useMemo`/`useCallback`.

## Decision 6 — Authentication Flow

- **Storage**: JWT in `localStorage`; `AuthProvider` restores it on boot and hydrates
  `user` via `GET /profile/me` (single source of profile truth).
- **Login**: `POST /auth/login` → store token; email in the response is not enough for
  header display → fetch `/profile/me` after login.
- **Register**: `POST /auth/register` returns the entity, **no token** → immediately call
  login (or `/profile/me` after login). Never build session state from the register response.
- **Guard**: `ProtectedRoute` redirects to `/login` when no token; auth-aware `useAuth()`.
- **Token refresh**: **none — backend has no refresh endpoint and a 1-day TTL.** On 401 the
  app clears auth and redirects to login. Acceptable for MVP; the decision to add refresh
  tokens is a backend change and should be surfaced to the user.

## Decision 7 — Real-time Messaging

**Recommendation: HTTP polling for the MVP. Seam for WebSockets later.**

- `useMessages(matchId)` hook with `refetchInterval` (≈5s) while the chat screen is mounted,
  plus Query's default `refetchOnWindowFocus`. Cheap, reliable, zero infra.
- The polling behavior lives entirely inside `useMessages` — when the backend grows a WS
  endpoint, swapping poll → socket touches one file per screen, not the API layer.
- Do NOT build WS infrastructure now: the backend is HTTP-only, and chat is a secondary
  flow in the MVP.

---

## Dependencies to Add (complete list)

| Package | Why |
| --- | --- |
| `react-router` | 6 routes + protected layout |
| `@tanstack/react-query` | server-state caching, loading/error, invalidation, polling |

Everything else (fetch, CSS modules, React Compiler) already exists. No axios, no Zustand,
no WS lib, no codegen. Typescript config and oxlint need no changes; CSS modules pattern
already in use (`App.css`/`index.css`) extends to components.

## Effort Sketch

Routing + auth shell + API layer/types: ~450–600 lines. Five feature screens: ~600–900
lines. Total MVP is **well over the 400-line review budget** → the tasks phase should
forecast chained PRs (e.g., slice 1: infra + auth; slice 2: discovery + profile;
slice 3: matches + chat). Delivery strategy is `ask-on-risk`.

---

## Risks & Decisions to Surface

1. **Provided context was inaccurate.** Routes are `/profile/me` (not `/profile`),
   `MatchResponse.partner` has only 5 fields, messages use `createdAt` not `sentAt`,
   `GeoPoint` is GeoJSON `{ type, coordinates }`. Build against this source-verified contract.
2. **CORS not enabled on the backend** → require the Vite dev proxy (no backend change needed).
3. **Backend leaks `passwordHash`** in `POST /auth/register` and `GET /profile/me` responses
   (TypeORM returns the full entity). Frontend MUST NOT type or rely on it; flag for a backend
   follow-up (strip via `select` / class-transformer). Not a frontend blocker.
4. **No refresh token; JWT TTL is 1 day.** Users will be logged out after 24h with no
   silent renewal. MVP-acceptable; backend change required to improve.
5. **Lat/lng asymmetry**: read returns GeoJSON coordinates `[lng, lat]`; write expects flat
   `latitude`/`longitude` numbers. Do not reuse the GeoPoint shape for the profile form.
6. **No test framework configured.** Design/verify phases must pick one (Vitest is the
   natural fit for Vite) — decision deferred out of explore.
7. **Agent-facing note**: `erasableSyntaxOnly` forbids TS `enum`/`namespace` — use literal
   union types; `verbatimModuleSyntax` requires `import type`.

## Ready for Proposal

**Yes** — the contract and architecture are both fully grounded in verified source. The
proposal phase should include a backend follow-up note (passwordHash leak) and leave the
WebSocket decision explicitly deferred.