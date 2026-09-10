# Proposal: Gym Buddy Frontend MVP

## Intent

Transform the empty Vite 8 + React 19 scaffold into a production-ready Tinder-style gym buddy matching app that consumes the verified `gym-buddy-api` backend. The backend is complete and running on port 3000 with all endpoints verified from source — the frontend is the only missing piece.

## Scope

### In Scope
- Auth flow (login/register/logout) with JWT in localStorage + ProtectedRoute guard
- Swipe queue on /discover: load suggestions, submit LIKE/PASS, detect mutual matches
- Profile page: view + edit form (gym, disciplines, bio, photos, location, experience, availability)
- Matches list + chat thread per match with HTTP polling (~5s refresh)
- API layer: fetch wrapper with token injection, ApiError normalization, 401 handler
- Hand-mirrored TypeScript types covering all backend response/request shapes
- CSS Modules for component styling (no design system dependency)

### Out of Scope
- Real-time WebSocket messaging (polling only; swap seam preserved in one file)
- OAuth / social login (no backend support)
- Password reset flow (no backend endpoint)
- Upload/cloud storage for photos (profile photos are URL strings in the existing API)
- Test framework setup (deferred to spec phase)
- Push notifications, offline support, PWA
- Internationalization
- A/B testing or analytics

## Capabilities

> Contract between proposal and specs phase. Each item becomes a dedicated delta spec.

### New Capabilities
- `auth`: registration, login, logout, token persistence in localStorage, user hydration via GET /profile/me, ProtectedRoute auth guard
- `discovery`: swipeable suggestion queue with POST /swipes, mutual-match detection on LIKE, suggestion refetch on swipe
- `profile`: view own profile (GET /profile/me), edit form (PATCH /profile/me) with lat/lng inputs distinct from GeoJSON read shape
- `matches`: match list (GET /matches) with partner preview (name, activity, experience)
- `chat`: message thread (GET + POST /matches/:id/messages) with 5s polling via TanStack Query refetchInterval

### Modified Capabilities
None — the current scaffold has no capabilities. This is greenfield.

## Approach

**Routing**: react-router with BrowserRouter, 6 routes (`/`, `/login`, `/register`, `/profile`, `/discover`, `/matches`, `/matches/:matchId`) + `<ProtectedRoute>` wrapper on all private screens. `/` redirects to `/discover` or `/login`.

**State**: TanStack Query owns all server state (suggestions, matches, messages) with built-in caching, invalidation, and refetchInterval for polling. One AuthProvider context for { token, user, login, register, logout } — the only genuine client state.

**API layer**: Thin fetch wrapper (~40 lines) injecting Authorization header, parsing NestJS error bodies into ApiError(status, message). Vite dev proxy `/api` → `localhost:3000` avoids CORS (backend has no `app.enableCors()`).

**Types**: Hand-mirrored in `src/api/types.ts` using literal unions for enums (no `enum` — `erasableSyntaxOnly` forbids runtime enums). GeoPoint asymmetry: read-side is GeoJSON `{ type, coordinates: [lng, lat] }`, write-side is flat `{ latitude, longitude }`.

**Components**: Feature folders (`features/{auth,discovery,profile,matches,chat}/`) + shared `components/ui/` layer with CSS Modules. React Compiler is enabled — no manual useMemo/useCallback.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/api/` | New | client.ts (fetch wrapper), types.ts, per-domain API modules |
| `src/auth/` | New | AuthContext.tsx, ProtectedRoute.tsx |
| `src/features/*/` | New | 5 feature folders (auth, discovery, profile, matches, chat) |
| `src/components/ui/` | New | Button, Input, Card, Badge, Avatar, Spinner |
| `src/App.tsx` | Rewrite | Replace Vite demo with providers + route table |
| `src/main.tsx` | Minor | Wrap with BrowserRouter + QueryClientProvider + AuthProvider |
| `vite.config.ts` | Modify | Add `server.proxy: { '/api': 'http://localhost:3000' }` |
| `package.json` | Modify | Add react-router + @tanstack/react-query |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend leaks passwordHash in responses | High | Frontend types exclude passwordHash; flag for backend follow-up |
| No refresh token — users booted after 24h | Medium | Document as MVP limitation; backend change required |
| GeoJSON vs flat lat/lng asymmetry causes bugs | Medium | Separate read/write types; review profile form carefully |
| Chat polling drains mobile battery | Low | 5s interval conservative; stop on unmount; WS swap seam in place |
| No test framework — verify phase has nothing to run | Low | Design phase should pick Vitest; tests written alongside features |
| Effort likely exceeds 400-line review budget | High | Tasks phase must forecast chained PR slices |

## Rollback Plan

Remove react-router and @tanstack/react-query from dependencies, revert App.tsx to scaffold state, delete `src/api/`, `src/auth/`, `src/features/`, `src/components/ui/`. Vite config proxy removal is additive and harmless. No database migration or backend change required — frontend-only revert.

## Dependencies

- `gym-buddy-api` running on port 3000 (already deployed and verified)
- New npm installs: `react-router` + `@tanstack/react-query`
- Vite dev proxy for CORS workaround

## Success Criteria

- [ ] User can register and login; token persists across reload
- [ ] Authenticated user can view + edit their profile
- [ ] Discovery screen loads suggestions, swipe actions work, mutual match detected
- [ ] Matches list shows real partners with name/activity
- [ ] Chat thread loads history and posts new messages with polling refresh
- [ ] Unauthenticated users redirect to /login for all protected routes