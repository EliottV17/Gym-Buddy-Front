import { ACTIVITIES } from '../../api/types.ts'
import type { Activity } from '../../api/types.ts'

export function DisciplinesSelect({
  value,
  onChange,
}: {
  value: readonly Activity[]
  onChange: (next: Activity[]) => void
}) {
  function toggle(activity: Activity) {
    const selected = value.includes(activity)
    onChange(selected ? value.filter((item) => item !== activity) : [...value, activity])
  }

  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-medium text-slate-700">Disciplines</legend>
      {ACTIVITIES.map((activity) => (
        <label key={activity} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
            checked={value.includes(activity)}
            onChange={() => toggle(activity)}
          />
          {activity}
        </label>
      ))}
    </fieldset>
  )
}