import { Navigate, Route, Routes } from 'react-router'
import { ProtectedRoute } from './auth/ProtectedRoute.tsx'
import { useAuth } from './auth/AuthContext.tsx'
import { LoginPage } from './features/auth/LoginPage.tsx'
import { RegisterPage } from './features/auth/RegisterPage.tsx'

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/discover" element={<DiscoverPlaceholder />} />
    </Route>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}

function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="grid min-h-screen place-items-center text-slate-500">Loading your account…</div>
  return <Navigate to={isAuthenticated ? '/discover' : '/login'} replace />
}

function DiscoverPlaceholder() {
  const { user, logout } = useAuth()
  return <main className="min-h-screen bg-slate-50 px-6 py-8"><div className="mx-auto flex max-w-4xl items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Gym Buddy</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, {user?.firstName}</h1><p className="mt-2 text-slate-600">Discovery is coming in the next feature slice.</p></div><button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={logout}>Log out</button></div></main>
}
