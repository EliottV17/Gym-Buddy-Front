import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, User } from '../api/types.ts'

export type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (details: RegisterRequest) => Promise<void>
  logout: () => void
}

// Shared auth context, isolated in its own module so component files
// (AuthContext.tsx) only export components — react/only-export-components.
export const authContext = createContext<AuthContextValue | null>(null)