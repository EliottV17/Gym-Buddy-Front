export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY'

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth?: string
  gender?: Gender
  gymName?: string
  disciplines?: string[]
  bio?: string
  photos?: string[]
  location?: { type: 'Point'; coordinates: [number, number] }
  experienceLevel?: string
  availability?: string[]
  createdAt?: string
  updatedAt?: string
}

export type LoginRequest = { email: string; password: string }

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type AuthResponse = {
  accessToken?: string
  token?: string
  user?: User
}

export type ApiErrorShape = { message?: string | string[] }
