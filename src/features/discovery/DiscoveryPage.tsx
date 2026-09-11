import { useState } from 'react'
import { useSuggestions } from '../../api/profile.ts'
import { isDuplicateSwipe, useCreateSwipe } from '../../api/swipes.ts'
import type { SwipeAction } from '../../api/types.ts'
import { useAuth } from '../../auth/AuthContext.tsx'
import { EmptySuggestions } from './EmptySuggestions.tsx'
import { SwipeCard } from './SwipeCard.tsx'

export function DiscoveryPage() {
  const { logout } = useAuth()
  const suggestions = useSuggestions(20)
  const swipe = useCreateSwipe()
  const [error, setError] = useState('')

  async function handleSwipe(action: SwipeAction) {
    const current = suggestions.data?.[0]
    if (!current) return
    setError('')
    try {
      await swipe.mutateAsync({ swipedId: current.id, action })
    } catch (cause) {
      // Duplicate swipes are idempotent: the card is already gone, so stay quiet.
      if (isDuplicateSwipe(cause)) return
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Gym Buddy</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Discover</h1>
          </div>
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={logout}
          >
            Log out
          </button>
        </div>

        {suggestions.isLoading ? (
          <p className="text-slate-500">Loading nearby athletes…</p>
        ) : suggestions.error || !suggestions.data ? (
          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-red-700">
              {suggestions.error instanceof Error ? suggestions.error.message : 'Unable to load nearby athletes.'}
            </p>
            <button
              className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => suggestions.refetch()}
            >
              Try again
            </button>
          </section>
        ) : suggestions.data.length === 0 ? (
          <EmptySuggestions onRefresh={() => void suggestions.refetch()} />
        ) : (
          <>
            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <SwipeCard user={suggestions.data[0]} onSwipe={(action) => void handleSwipe(action)} />
          </>
        )}
      </div>
    </main>
  )
}