import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, apiClient } from './client.ts'
import { SUGGESTIONS_KEY } from './profile.ts'
import type { CreateSwipeRequest, SwipeResult, User } from './types.ts'

/** POST /swipes — records a LIKE/PASS and returns whether it created a match. */
export async function createSwipe(request: CreateSwipeRequest): Promise<SwipeResult> {
  return apiClient<SwipeResult>('/swipes', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/** True when the failure is the backend's 409 duplicate-swipe response (idempotent for us). */
export function isDuplicateSwipe(cause: unknown): boolean {
  return cause instanceof ApiError && cause.status === 409
}

/**
 * Mutation hook for POST /swipes with an optimistic cache update: the swiped
 * user is removed from the cached suggestions immediately in `onMutate`, so the
 * next card renders without waiting for the network round-trip.
 *
 * On a duplicate swipe (409) the failure is ignored silently and the card stays
 * removed. On any other failure only the failed user is re-inserted at the
 * FRONT of the cache — never a full stale snapshot — so cards swiped meanwhile
 * stay removed.
 */
export function useCreateSwipe() {
  const queryClient = useQueryClient()
  return useMutation<SwipeResult, Error, CreateSwipeRequest, { previous: User[] } | undefined>({
    mutationFn: createSwipe,
    onMutate: async (request) => {
      const current = queryClient.getQueryData<User[]>(SUGGESTIONS_KEY)
      if (!current) return undefined
      queryClient.setQueryData(
        SUGGESTIONS_KEY,
        current.filter((candidate) => candidate.id !== request.swipedId),
      )
      return { previous: current }
    },
    onError: (cause, request, context) => {
      if (isDuplicateSwipe(cause)) return
      const failedUser = context?.previous?.find((candidate) => candidate.id === request.swipedId)
      if (!failedUser) return
      const current = queryClient.getQueryData<User[]>(SUGGESTIONS_KEY) ?? []
      if (current.some((candidate) => candidate.id === failedUser.id)) return
      queryClient.setQueryData(SUGGESTIONS_KEY, [failedUser, ...current])
    },
  })
}