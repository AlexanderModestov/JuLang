import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[auth] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars. ' +
    'Available env keys:', Object.keys(process.env).filter(k => k.includes('SUPA')).join(', ')
  )
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Verify the Authorization header contains a valid Supabase JWT.
 * Returns the User object on success, or sends a 401/500 response and returns null.
 */
export async function verifyAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<User | null> {
  if (!supabase) {
    console.error('[auth] Supabase client not initialized — check env vars')
    res.status(500).json({ error: 'Server misconfiguration' })
    return null
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return null
  }

  const token = authHeader.slice(7) // strip "Bearer "

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return null
    }
    return data.user
  } catch (err) {
    console.error('[auth] Supabase getUser threw:', err)
    res.status(500).json({ error: 'Authentication service error' })
    return null
  }
}
