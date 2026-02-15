import type { VercelRequest, VercelResponse } from '@vercel/node'

const DEFAULT_ORIGINS = [
  'http://localhost:1420',
  'http://localhost:5173',
  'tauri://localhost',
]

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS
  if (envOrigins) {
    return envOrigins.split(',').map((o) => o.trim()).filter(Boolean)
  }
  return DEFAULT_ORIGINS
}

/**
 * Handle CORS headers and OPTIONS preflight.
 * Returns `false` if the request was an OPTIONS preflight (caller should stop).
 * Returns `true` if the caller should continue processing.
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin
  const allowed = getAllowedOrigins()

  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return false
  }

  return true
}
