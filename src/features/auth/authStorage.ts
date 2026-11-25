import type { AuthTokens } from '@/models/auth'
import { readJson, writeJson, type KeyValueStorage } from '@/utils/safeStorage'

export const AUTH_STORAGE_KEY = 'lunchgo:v1:auth'
const AUTH_STORAGE_VERSION = 1

export function loadAuthTokens(storage: KeyValueStorage | undefined): AuthTokens | null {
  const saved = readJson(AUTH_STORAGE_KEY, storage)
  if (typeof saved !== 'object' || saved === null ||
      !('version' in saved) || saved.version !== AUTH_STORAGE_VERSION ||
      !('tokens' in saved) || typeof saved.tokens !== 'object' || saved.tokens === null ||
      !('accessToken' in saved.tokens) || typeof saved.tokens.accessToken !== 'string' || !saved.tokens.accessToken.trim() ||
      !('refreshToken' in saved.tokens) || typeof saved.tokens.refreshToken !== 'string' || !saved.tokens.refreshToken.trim()) {
    return null
  }
  return {
    accessToken: saved.tokens.accessToken,
    refreshToken: saved.tokens.refreshToken,
  }
}

export function saveAuthTokens(tokens: AuthTokens | null, storage: KeyValueStorage | undefined) {
  if (!tokens) {
    try {
      if (storage?.removeItem) storage.removeItem(AUTH_STORAGE_KEY)
      else storage?.setItem(AUTH_STORAGE_KEY, 'null')
    } catch {
      // Logout must still finish when browser storage is unavailable.
    }
    return
  }
  writeJson(AUTH_STORAGE_KEY, {
    version: AUTH_STORAGE_VERSION,
    tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
  }, storage)
}
