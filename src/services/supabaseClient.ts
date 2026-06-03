import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const useSupabase =
  import.meta.env.VITE_USE_SUPABASE === 'true' &&
  Boolean(url && anonKey)

export const supabase: SupabaseClient | null = useSupabase
  ? createClient(url!, anonKey!)
  : null
