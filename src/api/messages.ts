import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client.ts'

// Hand-mirrored message types. Keep in sync with the backend source
// (src/messages/ — MessageResponse): the field is `createdAt`, NOT `sentAt`,
// and the sender is reduced to id + firstName.

/** Single chat message serialized by the API. */
export type MessageResponse = {
  id: string
  content: string
  createdAt: string
  sender: { id: string; firstName: string }
}

/** GET /matches/:matchId/messages — thread history, oldest first (max 50). */
export async function getMessages(matchId: string): Promise<MessageResponse[]> {
  return apiClient<MessageResponse[]>(`/matches/${matchId}/messages`)
}

/**
 * Read hook for one chat thread with 5s HTTP polling (Decision 7 / R19).
 *
 * The polling lives entirely here via `refetchInterval`, so the screen drops
 * poll → subscribe with a single-file seam if the backend ever grows a
 * WebSocket endpoint. Query's `staleTime` (30s, set in main.tsx) does not
 * suppress the interval; refetchInterval fires regardless of staleness.
 */
export function useMessages(matchId: string | undefined) {
  return useQuery({
    queryKey: ['messages', matchId] as const,
    queryFn: () => getMessages(matchId ?? ''),
    enabled: Boolean(matchId),
    refetchInterval: 5000,
  })
}

/** POST /matches/:matchId/messages — body is `{ content }` (max 1000 chars). */
export async function sendMessage(matchId: string, content: string): Promise<MessageResponse> {
  return apiClient<MessageResponse>(`/matches/${matchId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

/**
 * Mutation hook for POST /matches/:matchId/messages. On success the cached
 * thread is refetched so the new message appears via the polling path (the
 * backend echoes the message back as the response, but refreshing keeps the
 * list authoritative and merges naturally with polled messages).
 */
export function useSendMessage(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => sendMessage(matchId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] })
    },
  })
}
