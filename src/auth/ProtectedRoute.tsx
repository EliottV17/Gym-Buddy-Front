import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthContext.tsx'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="grid min-h-screen place-items-center text-slate-500">Loading your account…</div>
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
