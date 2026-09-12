import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { ApiError, apiClient, clearStoredToken, getStoredToken, storeToken } from '../api/client.ts'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../api/types.ts'
import { authContext } from './authContext.ts'

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
      .catch((cause: unknown) => {
        // Only an invalid/expired token ends the session (scenario: expired
        // token → redirect to /login). A network outage must NOT log the user
        // out: keep the token so the app loads and the individual queries
        // surface the failure with a retry (R24) instead.
        if (cause instanceof ApiError && cause.status === 401) {
          clearStoredToken()
          setToken(null)
          setUser(null)
        }
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
    <authContext.Provider
      // The session survives a failed profile fetch: isAuthenticated tracks the
      // stored token, not the lazily loaded user profile.
      value={{ user, token, isAuthenticated: Boolean(token), isLoading, login, register, logout }}
    >
      {children}
    </authContext.Provider>
  )
}