import { Link, useParams } from 'react-router'
import { useMatch, type MatchResponse } from '../../api/matches.ts'
import { geoPointToLatLng } from '../../api/types.ts'
import { useAuth } from '../../auth/useAuth.ts'

export function MatchDetailPage() {
  const { logout } = useAuth()
  const { id } = useParams()
  const match = useMatch(id)

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Gym Buddy</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Match</h1>
          </div>
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={logout}
          >
            Log out
          </button>
        </div>

        {match.isLoading ? (
          <p className="text-slate-500">Loading match…</p>
        ) : match.error || !match.data ? (
          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-red-700">
              {match.error instanceof Error ? match.error.message : 'Unable to load this match.'}
            </p>
            <button
              className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => match.refetch()}
            >
              Try again
            </button>
          </section>
        ) : (
          <MatchView match={match.data} />
        )}
      </div>
    </main>
  )
}

function MatchView({ match }: { match: MatchResponse }) {
  const { partner } = match
  const initial = partner.firstName.charAt(0).toUpperCase()
  const location = geoPointToLatLng(partner.location)

  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center gap-6">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-indigo-100">
          <span className="text-3xl font-bold text-indigo-700">{initial}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{partner.firstName}</h2>
          {partner.activity ? (
            <span className="mt-2 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {partner.activity}
            </span>
          ) : null}
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <Row label="Experience" value={partner.experienceLevel ?? undefined} />
        <Row
          label="Location"
          value={location ? `${formatCoord(location.lat)}, ${formatCoord(location.lng)}` : undefined}
        />
        <Row label="Matched on" value={formatDate(match.createdAt)} />
      </dl>

      <div className="flex gap-3 pt-6">
        <Link
          to="/matches"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to matches
        </Link>
        <Link
          to={`/matches/${match.id}/chat`}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Open chat
        </Link>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-700">{value}</dd>
    </div>
  )
}

function formatCoord(value: number): string {
  return String(Math.round(value * 10000) / 10000)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}