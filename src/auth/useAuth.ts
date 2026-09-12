import { useContext } from 'react'
import { authContext } from './authContext.ts'

/** Access the AuthProvider context; throws when used outside an AuthProvider. */
export function useAuth() {
  const context = useContext(authContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}