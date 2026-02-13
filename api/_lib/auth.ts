import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

/**
 * Verify the Authorization header contains a valid Supabase JWT.
 * Returns the User object on success, or sends a 401 response and returns null.
 */
export async function verifyAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<User | null> {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return null
  }

  const token = authHeader.slice(7) // strip "Bearer "

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return null
  }

  return data.user
}
