import { useState, type FormEvent } from 'react'
import { useUpdateProfile } from '../../api/profile.ts'
import {
  ACTIVITIES,
  AVAILABILITIES,
  EXPERIENCE_LEVELS,
  geoPointToLatLng,
  latLngToLocatable,
} from '../../api/types.ts'
import type { Activity, UpdateProfileRequest, User } from '../../api/types.ts'
import { DisciplinesSelect } from './DisciplinesSelect.tsx'

type FormState = {
  gymName: string
  activity: string
  experienceLevel: string
  availability: string
  disciplines: Activity[]
  bio: string
  /** One photo URL per line. */
  photos: string
  latitude: string
  longitude: string
  searchDistanceKm: string
}

export function ProfileForm({
  user,
  onSaved,
  onCancel,
}: {
  user: User
  onSaved?: () => void
  onCancel?: () => void
}) {
  const mutation = useUpdateProfile()
  const [form, setForm] = useState<FormState>(() => toFormState(user))
  const [error, setError] = useState('')

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      await mutation.mutateAsync(toPatchRequest(form))
      onSaved?.()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save your profile.')
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field label="Gym name" value={form.gymName} onChange={(value) => update('gymName', value)} />

      <SelectField
        label="Activity"
        value={form.activity}
        options={ACTIVITIES}
        onChange={(value) => update('activity', value)}
      />
      <SelectField
        label="Experience level"
        value={form.experienceLevel}
        options={EXPERIENCE_LEVELS}
        onChange={(value) => update('experienceLevel', value)}
      />
      <SelectField
        label="Availability"
        value={form.availability}
        options={AVAILABILITIES}
        onChange={(value) => update('availability', value)}
      />

      <DisciplinesSelect value={form.disciplines} onChange={(value) => update('disciplines', value)} />

      <label className="block text-sm font-medium text-slate-700">
        Bio
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          rows={4}
          maxLength={500}
          placeholder="Tell people what training looks like for you…"
          value={form.bio}
          onChange={(event) => update('bio', event.target.value)}
        />
        <span className="mt-1 block text-xs text-slate-400">{form.bio.length}/500</span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Photos (one URL per line)
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          rows={3}
          placeholder="https://…"
          value={form.photos}
          onChange={(event) => update('photos', event.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Latitude"
          type="number"
          step="any"
          value={form.latitude}
          onChange={(value) => update('latitude', value)}
        />
        <Field
          label="Longitude"
          type="number"
          step="any"
          value={form.longitude}
          onChange={(value) => update('longitude', value)}
        />
      </div>

      <Field
        label="Search distance (km)"
        type="number"
        min={1}
        max={100}
        value={form.searchDistanceKm}
        onChange={(value) => update('searchDistanceKm', value)}
      />

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            disabled={mutation.isPending}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}

/** Seed the form from the user, converting GeoJSON `[lng, lat]` → `{ lat, lng }`. */
function toFormState(user: User): FormState {
  const location = geoPointToLatLng(user.location)
  return {
    gymName: user.gymName ?? '',
    activity: user.activity ?? '',
    experienceLevel: user.experienceLevel ?? '',
    availability: user.availability ?? '',
    disciplines: user.disciplines ?? [],
    bio: user.bio ?? '',
    photos: (user.photos ?? []).join('\n'),
    latitude: location ? String(location.lat) : '',
    longitude: location ? String(location.lng) : '',
    searchDistanceKm: user.searchDistanceKm !== undefined ? String(user.searchDistanceKm) : '',
  }
}

/** Convert the form back into the flat `{ latitude, longitude }` PATCH shape. */
function toPatchRequest(form: FormState): UpdateProfileRequest {
  const location = latLngToLocatable(parseLocation(form))
  return {
    gymName: emptyToUndefined(form.gymName),
    activity: enumValue(form.activity, ACTIVITIES),
    experienceLevel: enumValue(form.experienceLevel, EXPERIENCE_LEVELS),
    availability: enumValue(form.availability, AVAILABILITIES),
    disciplines: form.disciplines,
    bio: emptyToUndefined(form.bio),
    photos: splitLines(form.photos),
    latitude: location?.latitude,
    longitude: location?.longitude,
    searchDistanceKm: parseNumber(form.searchDistanceKm),
  }
}

function parseLocation(form: FormState) {
  const lat = parseNumber(form.latitude)
  const lng = parseNumber(form.longitude)
  if (lat === undefined || lng === undefined) return undefined
  return { lat, lng }
}

function parseNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function splitLines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

function emptyToUndefined(value: string): string | undefined {
  return value.trim() === '' ? undefined : value.trim()
}

/** Parse a select value against the allowed enum catalog; rejects anything else. */
function enumValue<T extends string>(value: string, allowed: readonly string[]): T | undefined {
  return allowed.includes(value) ? (value as T) : undefined
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: string
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
