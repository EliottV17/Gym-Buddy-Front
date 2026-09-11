// Hand-mirrored types for gym-buddy-api. Keep in sync with the backend source
// (src/users/entities/user.entity.ts, src/users/dto/update-profile.dto.ts).
// Enums are string-literal unions (no runtime `enum` — `erasableSyntaxOnly`).

export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY'

export type Activity = 'CROSSFIT' | 'CALISTENIA' | 'GYM' | 'RUNNING' | 'YOGA'

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type Availability = 'MORNING' | 'AFTERNOON' | 'EVENING'

/** GeoJSON point as returned by the API (read-side only). Coordinates are [lng, lat]. */
export type GeoPoint = {
  type: 'Point'
  coordinates: [number, number]
}

/** Write-side location shape: flat numbers the PATCH endpoint accepts. */
export type Locatable = { latitude: number; longitude: number }

/** Readable location: flat lat/lng for display and form editing. */
export type LatLng = { lat: number; lng: number }

/** Convert read-side GeoJSON `[lng, lat]` into `{ lat, lng }` for display. */
export function geoPointToLatLng(point: GeoPoint | null | undefined): LatLng | undefined {
  if (!point) return undefined
  const [lng, lat] = point.coordinates
  return { lat, lng }
}

/** Convert form `{ lat, lng }` into the write-side `{ latitude, longitude }` PATCH body. */
export function latLngToLocatable(value: LatLng | undefined): Locatable | undefined {
  if (!value) return undefined
  return { latitude: value.lat, longitude: value.lng }
}

export const ACTIVITIES: readonly Activity[] = ['CROSSFIT', 'CALISTENIA', 'GYM', 'RUNNING', 'YOGA']

export const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export const AVAILABILITIES: readonly Availability[] = ['MORNING', 'AFTERNOON', 'EVENING']

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth?: string
  gender?: Gender
  activity?: Activity
  experienceLevel?: ExperienceLevel
  availability?: Availability
  /** Read-side location. Comes back as GeoJSON `[lng, lat]` — do not reuse for the write path. */
  location?: GeoPoint
  gymName?: string
  disciplines?: Activity[]
  bio?: string
  photos?: string[]
  searchDistanceKm?: number
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

/**
 * PATCH /profile/me body (mirrors UpdateProfileDto). Location is written as flat
 * `latitude`/`longitude` numbers — the backend converts them into a GeoPoint.
 */
export type UpdateProfileRequest = {
  activity?: Activity
  experienceLevel?: ExperienceLevel
  availability?: Availability
  latitude?: number
  longitude?: number
  gymName?: string
  disciplines?: Activity[]
  bio?: string
  photos?: string[]
  searchDistanceKm?: number
}

// Hand-mirrored swipe types. Keep in sync with the backend source
// (src/swipes/entities/swipe.entity.ts, src/swipes/dto/create-swipe.dto.ts).
// The Swipe entity also returns FK relations (swiper/swipedUser); the frontend
// only needs the fields below.

export type SwipeAction = 'LIKE' | 'PASS'

export type CreateSwipeRequest = { swipedId: string; action: SwipeAction }

export type Swipe = {
  id: string
  action: SwipeAction
  createdAt?: string
}

/** POST /swipes response. */
export type SwipeResult = { swipe: Swipe; matched: boolean }

export type ApiErrorShape = { message?: string | string[] }