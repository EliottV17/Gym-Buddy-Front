import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client.ts'
import type { UpdateProfileRequest, User } from './types.ts'

export const PROFILE_KEY = ['profile', 'me'] as const

export async function getProfile(): Promise<User> {
  return apiClient<User>('/profile/me')
}

/** PATCH partial profile fields. Backend returns the full updated user. */
export async function updateProfile(patch: UpdateProfileRequest): Promise<User> {
  return apiClient<User>('/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function useProfile() {
  return useQuery({ queryKey: PROFILE_KEY, queryFn: getProfile })
}

export const SUGGESTIONS_KEY = ['profile', 'suggestions'] as const

/** GET /profile/suggestions — nearby candidates. Backend clamps limit to 1..20. */
export async function getSuggestions(limit = 20): Promise<User[]> {
  return apiClient<User[]>(`/profile/suggestions?limit=${limit}`)
}

export function useSuggestions(limit = 20) {
  return useQuery({ queryKey: SUGGESTIONS_KEY, queryFn: () => getSuggestions(limit) })
}

/**
 * Mutation hook for PATCH /profile/me. On success the cached profile is updated
 * from the mutation response so the view side stays in sync — no stale reads.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patch: UpdateProfileRequest) => {
      const updated = await updateProfile(patch)
      queryClient.setQueryData(PROFILE_KEY, updated)
      return updated
    },
  })
}