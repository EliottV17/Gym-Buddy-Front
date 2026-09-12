import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient, clearStoredToken, getStoredToken, storeToken } from '../api/client.ts'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../api/types.ts'

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (details: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function authToken(response: AuthResponse): string {
  const token = response.accessToken ?? response.token
  if (!token) throw new Error('The server did not return an authentication token.')
  return token
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) return
    apiClient<User>('/profile/me')
      .then(setUser)
      .catch(() => {
        clearStoredToken()
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  async function login(credentials: LoginRequest) {
    const response = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    const nextToken = authToken(response)
    storeToken(nextToken)
    setToken(nextToken)
    setUser(response.user ?? await apiClient<User>('/profile/me'))
  }

  async function register(details: RegisterRequest) {
    await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    })
  }

  function logout() {
    clearStoredToken()
    setToken(null)
    setUser(null)
    // Purge the whole query cache so the next session on this browser
    // cannot read the previous user's cached profile/suggestions/matches.
    queryClient.clear()
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(token && user), isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
