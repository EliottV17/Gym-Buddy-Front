import type { MessageResponse } from '../../api/messages.ts'

/**
 * Renders the chronological message thread. Messages from the current user
 * (`sender.id === userId`) align right; the partner's align left (R3 of the
 * chat request). Pure presentational component — no polling or scrolling here.
 */
export function MessageList({
  messages,
  userId,
}: {
  messages: MessageResponse[]
  userId: string
}) {
  if (messages.length === 0) {
    return <EmptyChat />
  }

  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} isOwn={message.sender.id === userId} />
      ))}
    </ul>
  )
}

function MessageBubble({ message, isOwn }: { message: MessageResponse; isOwn: boolean }) {
  return (
    <li className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
          isOwn ? 'rounded-br-sm bg-indigo-600 text-white' : 'rounded-bl-sm bg-white text-slate-900'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`mt-1 text-[0.65rem] ${
            isOwn ? 'text-indigo-200' : 'text-slate-400'
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </li>
  )
}

/** Empty state (R22): no messages yet → invite the user to start the thread. */
function EmptyChat() {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">No messages yet</h2>
      <p className="mt-2 text-sm text-slate-600">
        This is where your conversation starts. Say hi 👋
      </p>
    </div>
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
