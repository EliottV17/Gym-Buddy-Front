import { useState } from 'react'
import { useAuth } from '../../auth/useAuth.ts'
import { useProfile } from '../../api/profile.ts'
import { geoPointToLatLng } from '../../api/types.ts'
import type { User } from '../../api/types.ts'
import { ProfileForm } from './ProfileForm.tsx'

export function ProfilePage() {
  const { logout } = useAuth()
  const query = useProfile()
  const [isEditing, setIsEditing] = useState(false)

  if (query.isLoading) {
    return <PageShell><p className="text-slate-500">Loading your profile…</p></PageShell>
  }

  if (query.error || !query.data) {
    return (
      <PageShell>
        <p className="text-red-700">{query.error instanceof Error ? query.error.message : 'Unable to load your profile.'}</p>
        <button
          className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          onClick={() => query.refetch()}
        >
          Try again
        </button>
      </PageShell>
    )
  }

  const user = query.data
  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Gym Buddy</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Your profile</h1>
        </div>
        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={logout}>Log out</button>
      </div>

      {isEditing ? (
        <ProfileForm
          user={user}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView user={user} onEdit={() => setIsEditing(true)} />
      )}
    </PageShell>
  )
}

function ProfileView({ user, onEdit }: { user: User; onEdit: () => void }) {
  const location = geoPointToLatLng(user.location)
  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user.firstName} {user.lastName}</h2>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700" onClick={onEdit}>Edit</button>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <Row label="Gym" value={user.gymName} />
        <Row label="Activity" value={user.activity} />
        <Row label="Experience" value={user.experienceLevel} />
        <Row label="Availability" value={user.availability} />
        <Row label="Disciplines" value={user.disciplines?.join(', ')} />
        <Row label="Bio" value={user.bio} />
        <Row
          label="Location"
          value={location ? `${formatCoord(location.lat)}, ${formatCoord(location.lng)}` : undefined}
        />
        <Row label="Search radius" value={user.searchDistanceKm ? `${user.searchDistanceKm} km` : undefined} />
      </dl>

      {user.photos?.length ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {user.photos.map((photo) => (
            <li key={photo}>
              <a className="text-xs text-indigo-600 underline" href={photo} target="_blank" rel="noreferrer">{photo}</a>
            </li>
          ))}
        </ul>
      ) : null}
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

function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-50 px-6 py-8"><div className="mx-auto max-w-3xl">{children}</div></main>
}