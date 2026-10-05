const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalized}`
}

export function getAuthToken(): string | null {
  return localStorage.getItem('janmitra_token')
}

export function setAuthToken(token: string): void {
  localStorage.setItem('janmitra_token', token)
}

export function clearAuthToken(): void {
  localStorage.removeItem('janmitra_token')
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(apiUrl(path), { ...options, headers })

  if (response.status === 401) {
    clearAuthToken()
    throw new Error('UNAUTHORIZED')
  }

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}
