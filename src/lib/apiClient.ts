import { supabase } from './supabase'

/**
 * Authenticated fetch wrapper.
 * Adds Authorization: Bearer <access_token> from the current Supabase session.
 * Sets Content-Type: application/json unless the body is FormData (e.g. whisper multipart).
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) {
    throw new Error('Not authenticated')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)

  // Set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  return fetch(path, { ...options, headers })
}
