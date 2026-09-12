import { Link } from 'react-router'
import { useMatches, type MatchResponse } from '../../api/matches.ts'
import { useAuth } from '../../auth/useAuth.ts'

export function MatchListPage() {
  const { logout } = useAuth()
  const matches = useMatches()

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Gym Buddy</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Matches</h1>
          </div>
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={logout}
          >
            Log out
          </button>
        </div>

        {matches.isLoading ? (
          <p className="text-slate-500">Loading your matches…</p>
        ) : matches.error || !matches.data ? (
          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-red-700">
              {matches.error instanceof Error ? matches.error.message : 'Unable to load your matches.'}
            </p>
            <button
              className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => matches.refetch()}
            >
              Try again
            </button>
          </section>
        ) : matches.data.length === 0 ? (
          <EmptyMatches />
        ) : (
          <ul className="space-y-4">
            {matches.data.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

function MatchRow({ match }: { match: MatchResponse }) {
  const { partner } = match
  const initial = partner.firstName.charAt(0).toUpperCase()
  const preview = [partner.activity, partner.experienceLevel].filter(Boolean).join(' · ')

  return (
    <li className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-xl">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-100">
        <span className="text-lg font-bold text-indigo-700">{initial}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-slate-900">{partner.firstName}</h2>
        {preview ? <p className="mt-1 text-sm text-slate-600">{preview}</p> : null}
      </div>

      <div className="flex gap-2">
        <Link
          to={`/matches/${match.id}`}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          View
        </Link>
        <Link
          to={`/matches/${match.id}/chat`}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Chat
        </Link>
      </div>
    </li>
  )
}

/** Empty state (R17): no matches yet → guide the user back to Discovery. */
function EmptyMatches() {
  return (
    <section className="rounded-2xl bg-white p-10 text-center shadow-xl">
      <h2 className="text-xl font-bold text-slate-900">No matches yet</h2>
      <p className="mt-2 text-sm text-slate-600">
        Keep swiping — when another athlete likes you back, they will show up here.
      </p>
      <Link
        to="/discover"
        className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Discover athletes
      </Link>
    </section>
  )
}