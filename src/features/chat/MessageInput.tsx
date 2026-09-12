import { useState, type FormEvent } from 'react'
import { useSendMessage } from '../../api/messages.ts'

/**
 * Bottom-anchored composer (R20 / R25). The form is disabled while the POST
 * is in flight (`isPending`) and clears the textarea only after a successful
 * send. Failed sends keep the draft and surface the backend error inline.
 */
export function MessageInput({ matchId }: { matchId: string }) {
  const [text, setText] = useState('')
  const send = useSendMessage(matchId)
  const canSend = text.trim().length > 0 && !send.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = text.trim()
    if (!content || send.isPending) return
    // Clear only on success: a network failure (R24) must not lose the draft.
    send.mutate(content, {
      onSuccess: () => setText(''),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white px-6 py-4"
      aria-label="Send a message"
    >
      {send.isError ? (
        <p className="mb-2 text-sm text-red-700">
          {send.error instanceof Error ? send.error.message : 'Could not send your message.'}
        </p>
      ) : null}

      <div className="flex items-end gap-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={1}
          placeholder="Write a message…"
          disabled={send.isPending}
          aria-label="Message content"
          className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {send.isPending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}
