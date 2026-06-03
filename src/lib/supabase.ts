import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Checks if Supabase credentials are valid and defined.
 * Helps provide a safe fallback and UI warnings.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false
  if (supabaseUrl === "YOUR_SUPABASE_URL" || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") return false
  if (supabaseUrl.trim() === "" || supabaseAnonKey.trim() === "") return false
  return true
}

// Safely obtain a Supabase client without crashing the application on load
const initSupabase = () => {
  if (!isSupabaseConfigured()) {
    console.warn(
      "Supabase environment variables are missing or not configured. Using placeholder configuration to prevent startup crashes."
    )
    // Return a dummy/placeholder client with a valid URL structure to avoid immediate initialization failures
    return createClient("https://placeholder-project.supabase.co", "placeholder-key")
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = initSupabase()
