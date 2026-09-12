import { Navigate, Route, Routes } from 'react-router'
import { ProtectedRoute } from './auth/ProtectedRoute.tsx'
import { useAuth } from './auth/useAuth.ts'
import { LoginPage } from './features/auth/LoginPage.tsx'
import { RegisterPage } from './features/auth/RegisterPage.tsx'
import { ProfilePage } from './features/profile/ProfilePage.tsx'
import { DiscoveryPage } from './features/discovery/DiscoveryPage.tsx'
import { MatchDetailPage } from './features/matches/MatchDetailPage.tsx'
import { MatchListPage } from './features/matches/MatchListPage.tsx'

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/discover" element={<DiscoveryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/matches" element={<MatchListPage />} />
      <Route path="/matches/:id" element={<MatchDetailPage />} />
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