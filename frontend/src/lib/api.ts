const TOKEN_KEY = 'foody_token'

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json()
    if (body.errors && typeof body.errors === 'object') {
      const messages = Object.values(body.errors as Record<string, string>)
      if (messages.length > 0) {
        return messages.join(' ')
      }
    }
    return body.detail ?? body.title ?? fallback
  } catch {
    return response.statusText || fallback
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(path, { ...options, headers })

  if (response.status === 401) {
    const isAuthAttempt = path === '/api/auth/login' || path === '/api/auth/register'

    if (isAuthAttempt) {
      const message = await parseErrorMessage(response, 'E-mail ou senha incorretos')
      throw new Error(message)
    }

    clearToken()
    onUnauthorized?.()
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response, 'Erro inesperado')
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  register: (data: { name: string; email: string; password: string }) =>
    request<import('./types').AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<import('./types').AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<import('./types').User>('/api/auth/me'),

  listOrders: (status?: string) => {
    const query = status ? `?status=${status}` : ''
    return request<import('./types').PageResponse<import('./types').Order>>(`/api/orders${query}`)
  },

  getOrder: (id: number) => request<import('./types').Order>(`/api/orders/${id}`),

  createOrder: (data: import('./types').CreateOrderRequest) =>
    request<import('./types').Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOrderStatus: (id: number, status: import('./types').OrderStatus) =>
    request<import('./types').Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}
