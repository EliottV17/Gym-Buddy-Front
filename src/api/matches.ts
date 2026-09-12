import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client.ts'
import type { Activity, ExperienceLevel, GeoPoint } from './types.ts'

// Hand-mirrored match types. Keep in sync with the backend source
// (src/matches/matches.service.ts — MatchResponse): the partner preview is
// deliberately reduced to these fields, no photos/gymName/disciplines.

/** Reduced partner preview serialized on every match. */
export type MatchPartner = {
  id: string
  firstName: string
  activity: Activity | null
  experienceLevel: ExperienceLevel | null
  location: GeoPoint | null
}

/** GET /matches + GET /matches/:id response. */
export type MatchResponse = {
  id: string
  createdAt: string
  partner: MatchPartner
}

export const MATCHES_KEY = ['matches'] as const

/** GET /matches — all matches for the current user, newest first. */
export async function getMatches(): Promise<MatchResponse[]> {
  return apiClient<MatchResponse[]>('/matches')
}

export function useMatches() {
  return useQuery({ queryKey: MATCHES_KEY, queryFn: getMatches })
}

/** GET /matches/:id — one match; 404 when it does not involve the user. */
export async function getMatch(matchId: string): Promise<MatchResponse> {
  return apiClient<MatchResponse>(`/matches/${matchId}`)
}

export function useMatch(matchId: string | undefined) {
  return useQuery({
    queryKey: ['matches', matchId] as const,
    queryFn: () => getMatch(matchId ?? ''),
    enabled: Boolean(matchId),
  })
}