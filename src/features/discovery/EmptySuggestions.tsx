/** Empty state rendered when the suggestions queue is exhausted. */
export function EmptySuggestions({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <section className="rounded-2xl bg-white p-10 text-center shadow-xl">
      <h2 className="text-xl font-bold text-slate-900">No more profiles nearby</h2>
      <p className="mt-2 text-sm text-slate-600">
        You have seen every athlete matching your preferences. Check back later or widen your search radius.
      </p>
      <button
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        onClick={onRefresh}
      >
        Refresh
      </button>
    </section>
  )
}