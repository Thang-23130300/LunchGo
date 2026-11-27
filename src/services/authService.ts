import { authRequest, AuthError } from '@/api/auth'
import type { AuthSession, AuthTokens, LoginCredentials, RefreshTokenRequest, UserAddress, UserProfile } from '@/models/auth'

export { AuthError } from '@/api/auth'

export interface AuthService {
  login(credentials: LoginCredentials, signal?: AbortSignal): Promise<AuthSession>
  getMe(accessToken: string, signal?: AbortSignal): Promise<UserProfile>
  refresh(request: RefreshTokenRequest, signal?: AbortSignal): Promise<AuthTokens>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readAddress(value: unknown): UserAddress | undefined {
  if (!isRecord(value)) return undefined
  const address: UserAddress = {}
  for (const field of ['address', 'city', 'state', 'postalCode', 'country'] as const) {
    if (typeof value[field] === 'string') address[field] = value[field]
  }
  return Object.keys(address).length > 0 ? address : undefined
}

function readUser(value: unknown): UserProfile {
  if (!isRecord(value) || typeof value.id !== 'number' || !Number.isSafeInteger(value.id) || value.id <= 0 ||
      typeof value.username !== 'string' || !value.username.trim() ||
      typeof value.email !== 'string' || typeof value.firstName !== 'string' ||
      typeof value.lastName !== 'string' || typeof value.image !== 'string') {
    throw new AuthError('INVALID_RESPONSE', 'Thông tin tài khoản trả về không hợp lệ.')
  }

  // Keep only public profile fields; /auth/me also returns unrelated demo data.
  const address = readAddress(value.address)
  return {
    id: value.id,
    username: value.username,
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
    image: value.image,
    ...(typeof value.gender === 'string' ? { gender: value.gender } : {}),
    ...(typeof value.phone === 'string' ? { phone: value.phone } : {}),
    ...(address ? { address } : {}),
  }
}

function readTokens(value: unknown): AuthTokens {
  if (!isRecord(value) || typeof value.accessToken !== 'string' || !value.accessToken.trim() ||
      typeof value.refreshToken !== 'string' || !value.refreshToken.trim()) {
    throw new AuthError('INVALID_RESPONSE', 'Token đăng nhập trả về không hợp lệ.')
  }
  return { accessToken: value.accessToken, refreshToken: value.refreshToken }
}

function validateExpiry(expiresInMins: number | undefined) {
  if (expiresInMins !== undefined && (!Number.isFinite(expiresInMins) || expiresInMins <= 0)) {
    throw new AuthError('INVALID_INPUT', 'Thời hạn phiên đăng nhập phải lớn hơn 0.')
  }
}

export const authService: AuthService = {
  async login(credentials, signal) {
    const username = credentials.username.trim()
    if (!username || !credentials.password.trim()) {
      throw new AuthError('INVALID_INPUT', 'Vui lòng nhập tên đăng nhập và mật khẩu.')
    }
    validateExpiry(credentials.expiresInMins)
    const data = await authRequest('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, username }),
    }, signal)
    return { user: readUser(data), tokens: readTokens(data) }
  },

  async getMe(accessToken, signal) {
    if (!accessToken.trim()) {
      throw new AuthError('UNAUTHORIZED', 'Bạn cần đăng nhập để xem thông tin tài khoản.')
    }
    const data = await authRequest('/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }, signal)
    return readUser(data)
  },

  async refresh(request, signal) {
    if (!request.refreshToken.trim()) {
      throw new AuthError('UNAUTHORIZED', 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
    }
    validateExpiry(request.expiresInMins)
    const data = await authRequest('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }, signal)
    return readTokens(data)
  },
}
