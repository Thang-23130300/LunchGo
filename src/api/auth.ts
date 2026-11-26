import { AUTH_API_BASE_URL } from './config'
import type { AuthErrorCode } from '@/models/auth'

export class AuthError extends Error {
  readonly code: AuthErrorCode
  readonly status?: number

  constructor(code: AuthErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.status = status
  }
}

type AuthEndpoint = '/auth/login' | '/auth/me' | '/auth/refresh'

// Auth uses its own host; product/order requests continue to use JSON Server.
export async function authRequest(
  endpoint: AuthEndpoint,
  init: RequestInit,
  signal?: AbortSignal,
): Promise<unknown> {
  const timeout = AbortSignal.timeout(15_000)
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout

  try {
    const response = await fetch(`${AUTH_API_BASE_URL}${endpoint}`, {
      ...init,
      credentials: 'omit',
      signal: requestSignal,
      headers: { Accept: 'application/json', ...init.headers },
    })

    if (!response.ok) {
      if (endpoint === '/auth/login' && (response.status === 400 || response.status === 401)) {
        throw new AuthError('INVALID_CREDENTIALS', 'Tên đăng nhập hoặc mật khẩu chưa đúng.', response.status)
      }
      if (response.status === 401 || response.status === 403) {
        throw new AuthError('UNAUTHORIZED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', response.status)
      }
      throw new AuthError('HTTP_ERROR', 'Dịch vụ đăng nhập đang gặp lỗi. Vui lòng thử lại sau.', response.status)
    }

    try {
      return await response.json()
    } catch (error) {
      if (requestSignal.aborted || error instanceof TypeError) throw error
      throw new AuthError('INVALID_RESPONSE', 'Dữ liệu đăng nhập trả về không hợp lệ.')
    }
  } catch (error) {
    if (signal?.aborted) throw signal.reason
    if (timeout.aborted) throw new AuthError('TIMEOUT', 'Dịch vụ đăng nhập phản hồi quá lâu. Vui lòng thử lại.')
    if (error instanceof AuthError) throw error
    throw new AuthError('NETWORK_ERROR', 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.')
  }
}
