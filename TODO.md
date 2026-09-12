# Post-MVP TODO

Follow-ups deferred until after the MVP ships. Nothing here blocks any merged PR.

## Spec cleanup

- [ ] Update `openspec/changes/gym-buddy-frontend/spec.md` — requirement **R15** is out of date. The backend `MatchResponse` (gym-buddy-api `src/matches/matches.service.ts`) serializes a deliberately reduced partner: `id, firstName, activity, experienceLevel, location` (all nullable except `id`/`firstName`). There is **no** `gymName`, `disciplines` or `photos` in the Matches payload, so the detail page shows what the API actually returns (`location` via `geoPointToLatLng`). Adjust R15 (and the Components/Vlidation sections if needed) to match, likely as part of opening an OpenSpec change for the PR 4 scope.

## Non-blocking review findings (15, all informational)

Source: native review lineage `review-0085ee4c1648f488` on the PR 4 candidate (lenses: risk, readability, reliability, resilience). The closure marked every finding as **non-blocking** — none opened a correction and none reopens the review. The table notes describe the code at the reported location; the reviewer's own reasoning lives in the review artifacts of that lineage.

| ID | Lens | Severity | Location | What is there |
|---|---|---|---|---|
| R1-RawMatchIdInRequestPath | risk | WARNING | `src/api/matches.ts:38` | `getMatch()` interpolates the raw match id into the request path |
| R2-001 | readability | WARNING | `src/features/matches/MatchDetailPage.tsx:86-91` | "Open chat" `Link` row, `to={`/matches/${match.id}/chat`}` |
| R2-002 | readability | WARNING | `src/auth/AuthContext.tsx:23-33` | Hydration `useEffect` catch block (401-only logout) |
| R2-003 | readability | SUGGESTION | `src/features/matches/MatchListPage.tsx:12-23` | Page header block (brand, title, Log out) |
| R2-004 | readability | SUGGESTION | `src/api/matches.ts:41-46` | `useMatch` — closure calls `getMatch(matchId ?? '')` |
| R2-005 | readability | SUGGESTION | `src/api/matches.ts:5-7` | "Hand-mirrored" comment block |
| R3-001 | reliability | WARNING | `src/features/matches/MatchListPage.tsx:77` | "Chat" `Link`, `to={`/matches/${match.id}/chat`}` |
| R3-002 | reliability | WARNING | `src/auth/AuthContext.tsx:28` | `ApiError.status === 401` guard |
| R3-003 | reliability | WARNING | `src/auth/AuthContext.tsx:66` | `isAuthenticated: Boolean(token)` value (inside comment block) |
| R3-004 | reliability | SUGGESTION | `src/features/matches/MatchDetailPage.tsx:112` | `formatDate()` helper |
| R3-005 | reliability | SUGGESTION | `src/api/matches.ts:44` | `queryFn: () => getMatch(matchId ?? '')` |
| R4-1 | resilience | WARNING | `src/auth/AuthContext.tsx:23-32` | Catch: network errors keep the token, only 401 logs out |
| R4-2 | resilience | WARNING | `src/features/matches/MatchDetailPage.tsx:86-91` | "Open chat" link block |
| R4-3 | resilience | SUGGESTION | `src/features/matches/MatchDetailPage.tsx:29-40` | Error section with "Try again" retry |
| R4-4 | resilience | SUGGESTION | `src/api/matches.ts:27-30` | `getMatches()` list fetch |

Cluster to look at first when triaging (repeated across lenses):

- **Chat links** — R1 / R2-001 / R3-001 / R4-2 all point at the `/:id/chat` navigation surface (`MatchDetailPage`, `MatchListPage`, raw id in path). Revisit together with the PR 5 Chat work.
- **AuthContext resilience** — R2-002 / R3-002 / R3-003 / R4-1 all point at the hydration catch and `isAuthenticated` semantics. Revisit if the 401-only decision is revisited.