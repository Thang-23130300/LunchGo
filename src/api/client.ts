import { API_BASE_URL } from './config'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, path: string) {
    super(`Không thể tải dữ liệu từ ${path} (HTTP ${status}).`)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) throw new ApiError(response.status, path)

  return response.json() as Promise<T>
}

export async function getById<T>(collection: string, id: string, signal?: AbortSignal): Promise<T | null> {
  if (!id.trim()) throw new TypeError('ID cần có giá trị.')

  try {
    return await getJson<T>(`${collection}/${encodeURIComponent(id)}`, signal)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}
