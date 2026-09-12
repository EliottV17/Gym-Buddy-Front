import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router'
import { useMatch } from '../../api/matches.ts'
import { useMessages } from '../../api/messages.ts'
import { useAuth } from '../../auth/useAuth.ts'
import { MessageInput } from './MessageInput.tsx'
import { MessageList } from './MessageList.tsx'

/**
 * Chat thread screen (R18–R22).
 *
 * - Read via `useMessages(matchId)`, which polls every 5s via refetchInterval.
 * - Auto-scrolls to the bottom when new messages arrive or on first load using
 *   a trailing `useRef` anchor + `scrollIntoView({ behavior: 'smooth' })`.
 * - The composer is anchored to the bottom of the viewport by the flex layout.
 */
export function ChatPage() {
  const { logout } = useAuth()
  const { user } = useAuth()
  const { matchId } = useParams()
  const messages = useMessages(matchId)
  const match = useMatch(matchId)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll on mount and whenever the message count changes (new message from
  // polling or a successful send). Depends on length, not the array identity,
  // so refetch cycles that return the same messages do not fight the user's
  // scroll position every 5s.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.data?.length])

  if (!matchId || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-slate-500">
        <p>Please open a match to start chatting.</p>
      </main>
    )
  }

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Gym Buddy</p>
          <h1 className="text-lg font-bold text-slate-900">
            {match.data?.partner.firstName ?? 'Chat'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/matches"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Matches
          </Link>
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl">
          {messages.isLoading ? (
            <p className="text-slate-500">Loading messages…</p>
          ) : messages.isError ? (
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-red-700">
                {messages.error instanceof Error
                  ? messages.error.message
                  : 'Unable to load messages.'}
              </p>
              <button
                className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => messages.refetch()}
              >
                Try again
              </button>
            </section>
          ) : (
            <MessageList messages={messages.data ?? []} userId={user.id} />
          )}
          {/* Trailing anchor: scrollIntoView target for auto-scroll (R21). */}
          <div ref={bottomRef} />
        </div>
      </div>

      <MessageInput matchId={matchId} />
    </main>
  )
}
