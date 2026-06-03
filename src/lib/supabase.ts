import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false
  if (supabaseUrl === "YOUR_SUPABASE_URL" || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") return false
  if (supabaseUrl.trim() === "" || supabaseAnonKey.trim() === "") return false
  return true
}

console.log("URL:", supabaseUrl)
console.log("KEY:", supabaseAnonKey)
console.log("CONFIGURED:", isSupabaseConfigured())

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-key"
)