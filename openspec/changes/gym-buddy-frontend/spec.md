# Gym Buddy Frontend — MVP Specification

## Auth

| # | Requirement |
|---|---|
| R1 | AuthProvider MUST manage JWT in `localStorage`, expose `{ user, token, isAuthenticated, login, register, logout }`, hydrate on mount |
| R2 | Login page MUST POST `/auth/login` (email, password); redirect to `/discover` on success |
| R3 | Register page MUST collect firstName, lastName, email, password, dateOfBirth, gender; POST `/auth/register` then redirect to `/login` |
| R4 | ProtectedRoute MUST redirect to `/login` when unauthenticated |
| R5 | Logout MUST clear `localStorage` and redirect to `/login` |

**Scenarios**: Valid login → store token, redirect. Invalid creds → error, stay. Expired token → redirect. Register → redirect to login. Reload → auth persists.

## Profile

| # | Requirement |
|---|---|
| R6 | Profile page MUST GET `/api/v1/profile/me` on mount, display all fields |
| R7 | Edit MUST PATCH partial fields to `/api/v1/profile/me` |
| R8 | Location: display convert GeoJSON `[lng, lat]` → `{ lat, lng }`; write as flat `{ latitude, longitude }` |
| R9 | Disciplines multi-select; bio textarea ≤500 chars; photos as URL strings (no upload) |

**Scenarios**: Load → display all fields. Edit + save → PATCH, UI updates. GeoJSON coords → readable display.

## Discovery

| # | Requirement |
|---|---|
| R10 | Page MUST GET `/api/v1/profile/suggestions?limit=20` on mount |
| R11 | Cards MUST support LIKE/PASS via POST `/api/v1/swipes` `{ swipedUserId, action }` |
| R12 | 409 duplicate swipe MUST silently advance to next card |
| R13 | Empty suggestions MUST render "No more profiles nearby" |

**Scenarios**: Swipe right → POST LIKE, advance card. 409 → silently advance. Empty list → empty-state.

## Matches

| # | Requirement |
|---|---|
| R14 | List MUST GET `/api/v1/matches`, render partner previews |
| R15 | Detail MUST GET `/api/v1/matches/:id`, show partner: id, firstName, gymName, disciplines, photos |
| R16 | Each match MUST link to `/matches/:id/chat` |
| R17 | Empty state when no matches exist |

**Scenarios**: Matches → show cards. No matches → "No matches yet". Detail → chat navigation.

## Chat

| # | Requirement |
|---|---|
| R18 | Page MUST GET `/api/v1/matches/:matchId/messages` on mount |
| R19 | Poll every 5s via `setInterval`; MUST clear on unmount |
| R20 | Send MUST POST `{ content }` to `/api/v1/matches/:matchId/messages` |
| R21 | Auto-scroll to bottom on new messages |
| R22 | Empty state when no messages |

**Scenarios**: Poll → new message → append, scroll. Send → POST, clear input. Unmount → interval cleared.

## Cross-cutting

| # | Requirement |
|---|---|
| R23 | Shared `apiClient` MUST attach `Authorization: Bearer <token>` to all requests |
| R24 | Network errors MUST surface user-friendly messages, not raw fetch errors |
| R25 | Forms SHOULD disable submit during in-flight requests |

## Components

`AuthProvider`, `ProtectedRoute`, `LoginPage`, `RegisterPage`, `ProfilePage`, `ProfileForm`, `DisciplinesSelect`, `DiscoveryPage`, `SwipeCard`, `EmptySuggestions`, `MatchListPage`, `MatchDetailPage`, `ChatPage`, `MessageList`, `MessageInput`, `useChatPolling`, `apiClient`.

## Validation

1. Register → login → `/discover`
2. Unauthenticated → redirect to `/login`
3. Token survives hard reload
4. Profile: load, edit, save
5. Discovery: swipe cards, 409 handled
6. Matches: list, detail, chat link
7. Chat: poll, send, scroll, unmount cleanup
8. Forms disable during submit