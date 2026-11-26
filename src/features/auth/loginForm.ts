import type { LoginCredentials } from '@/models/auth'

export type LoginFields = Pick<LoginCredentials, 'username' | 'password'>
export type LoginFieldErrors = Partial<Record<keyof LoginFields, string>>

export function validateLoginFields(fields: LoginFields): LoginFieldErrors {
  const errors: LoginFieldErrors = {}
  if (!fields.username.trim()) errors.username = 'Vui lòng nhập tên đăng nhập.'
  if (!fields.password.trim()) errors.password = 'Vui lòng nhập mật khẩu.'
  return errors
}

export function getLoginDestination(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') ||
      Array.from(value).some((character) =>
        character === '\\' || character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
      )) return '/'

  try {
    const destination = new URL(value, 'https://lunchgo.local')
    const pathname = decodeURIComponent(destination.pathname).replace(/\/+$/, '').toLowerCase()
    if (destination.origin !== 'https://lunchgo.local' || pathname === '/login') return '/'
    return `${destination.pathname}${destination.search}${destination.hash}`
  } catch {
    return '/'
  }
}
