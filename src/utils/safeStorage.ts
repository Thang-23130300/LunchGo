export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function getBrowserStorage(): KeyValueStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function readJson(key: string, storage: KeyValueStorage | undefined): unknown {
  try {
    const raw = storage?.getItem(key)
    return raw == null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

export function writeJson(key: string, value: unknown, storage: KeyValueStorage | undefined) {
  try {
    storage?.setItem(key, JSON.stringify(value))
  } catch {
    // A blocked or full storage must not interrupt the current session.
  }
}
