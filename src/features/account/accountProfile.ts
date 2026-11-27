import type { UserProfile } from '@/models/auth'
import { getBrowserStorage, readJson, type KeyValueStorage } from '@/utils/safeStorage'

export interface ProfileExtras {
  phone: string
  address: string
}

export type ProfileFieldErrors = Partial<Record<keyof ProfileExtras, string>>

export function profileStorageKey(userId: number): string {
  return `lunchgo:v1:profile:${userId}`
}

export function formatUserAddress(address: UserProfile['address']): string {
  return [address?.address, address?.city, address?.state, address?.postalCode, address?.country]
    .filter((part) => part?.trim()).join(', ')
}

export function validateProfileExtras(values: ProfileExtras): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {}
  const phone = values.phone.trim()
  const digitCount = phone.replace(/\D/g, '').length
  if (phone && (!/^\+?[\d\s().-]+$/.test(phone) || digitCount < 7 || digitCount > 15 || phone.length > 40)) {
    errors.phone = 'Nhập số điện thoại hợp lệ gồm 7–15 chữ số, có thể có mã quốc gia.'
  }
  if (values.address.trim().length > 500) errors.address = 'Địa chỉ không được dài quá 500 ký tự.'
  return errors
}

export function loadProfileExtras(
  userId: number,
  storage: KeyValueStorage | undefined = getBrowserStorage(),
): ProfileExtras | null {
  if (!Number.isSafeInteger(userId) || userId <= 0) return null
  const saved = readJson(profileStorageKey(userId), storage)
  if (typeof saved !== 'object' || saved === null ||
      !('version' in saved) || saved.version !== 1 || !('userId' in saved) || saved.userId !== userId ||
      !('phone' in saved) || typeof saved.phone !== 'string' ||
      !('address' in saved) || typeof saved.address !== 'string') return null
  const values = { phone: saved.phone.trim(), address: saved.address.trim() }
  return Object.keys(validateProfileExtras(values)).length ? null : values
}

export function getAccountContact(user: UserProfile, storage?: KeyValueStorage): ProfileExtras {
  return loadProfileExtras(user.id, storage) ?? {
    phone: user.phone ?? '',
    address: formatUserAddress(user.address),
  }
}

export function saveProfileExtras(
  userId: number,
  values: ProfileExtras,
  storage: KeyValueStorage | undefined = getBrowserStorage(),
): boolean {
  if (!Number.isSafeInteger(userId) || userId <= 0 || !storage || Object.keys(validateProfileExtras(values)).length) return false
  try {
    storage.setItem(profileStorageKey(userId), JSON.stringify({
      version: 1,
      userId,
      phone: values.phone.trim(),
      address: values.address.trim(),
    }))
    return true
  } catch {
    return false
  }
}
