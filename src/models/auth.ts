export interface UserProfile {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image: string
  gender?: string
  phone?: string
}

export interface LoginCredentials {
  username: string
  password: string
  expiresInMins?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
  expiresInMins?: number
}

export interface AuthSession {
  user: UserProfile
  tokens: AuthTokens
}

export type AuthErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'INVALID_RESPONSE'
