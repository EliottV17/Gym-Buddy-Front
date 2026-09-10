import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/AuthContext.tsx'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password })
      navigate('/login', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 mb-8 text-slate-600">Meet people who train like you do.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" value={form.firstName} onChange={(value) => update('firstName', value)} required />
            <Field label="Last name" value={form.lastName} onChange={(value) => update('lastName', value)} required />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} required />
          <Field label="Password" type="password" value={form.password} onChange={(value) => update('password', value)} required />
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Register'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-indigo-600" to="/login">Sign in</Link></p>
      </section>
    </main>
  )
}

function Field({ label, type = 'text', value, onChange, required }: { label: string; type?: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>
}
