import type { SwipeAction, User } from '../../api/types.ts'

/** Pure presentational swipe card for the top suggestions candidate. */
export function SwipeCard({ user, onSwipe }: { user: User; onSwipe: (action: SwipeAction) => void }) {
  const photo = user.photos?.[0]
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-xl">
      {photo ? (
        <img className="h-72 w-full object-cover" src={photo} alt={`${user.firstName} ${user.lastName}`} />
      ) : (
        <div className="grid h-72 w-full place-items-center bg-slate-100">
          <span className="text-5xl font-bold text-slate-400">{initials}</span>
        </div>
      )}

      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </h2>
            {user.gymName ? <p className="mt-1 text-sm text-slate-600">{user.gymName}</p> : null}
          </div>
          {user.activity ? (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {user.activity}
            </span>
          ) : null}
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Experience" value={user.experienceLevel} />
          <Detail label="Availability" value={user.availability} />
        </dl>

        {user.bio ? <p className="text-sm leading-relaxed text-slate-600">{user.bio}</p> : null}

        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => onSwipe('PASS')}
          >
            Pass
          </button>
          <button
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            onClick={() => onSwipe('LIKE')}
          >
            Like
          </button>
        </div>
      </div>
    </section>
  )
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-700">{value}</dd>
    </div>
  )
}