import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

/**
 * Crée un client Supabase pour le navigateur (côté client)
 * À utiliser dans les composants React
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
