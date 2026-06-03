import React, { useState, useEffect } from "react"
import bgLogo from "../assets/images/bg_logo_1779866363731.png"
import { supabase, isSupabaseConfigured } from "../lib/supabase"

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseActive, setSupabaseActive] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    }
    setSupabaseActive(isSupabaseConfigured())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email) {
      setError("Email Admin tidak boleh kosong!")
      return
    }
    if (!password) {
      setError("Password tidak boleh kosong!")
      return
    }

    setIsLoading(true)
    
    if (rememberMe) {
      localStorage.setItem("rememberEmail", email)
    } else {
      localStorage.removeItem("rememberEmail")
      localStorage.removeItem("rememberPassword")
    }

    try {
      if (supabaseActive) {
        // Authenticate with real Supabase Auth
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          setError(authError.message)
          setIsLoading(false)
          return
        }

        if (data.session) {
          localStorage.setItem("token", data.session.access_token)
          localStorage.setItem("user", JSON.stringify(data.session.user || { email }))
          sessionStorage.setItem("isLoggedIn", "true")
        }
      } else {
        // Fallback for easy offline/preview testing
        localStorage.setItem("token", "mock-token-123456")
        localStorage.setItem("user", JSON.stringify({ email }))
        sessionStorage.setItem("isLoggedIn", "true")
      }

      setError("")
      onLogin()
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    alert("Silakan hubungi administrator IT Baloeng Gedhe untuk mereset password Anda.")
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img
            src={bgLogo}
            alt="Baloeng Gedhe Logo"
            className="w-16 h-16 mx-auto mb-4 rounded-full object-cover border border-gray-100 shadow-sm"
            onError={(e) => {
              // fallback in case of load issues
              e.currentTarget.src = "/logo-baloeng.png"
            }}
          />

          <h1 className="text-3xl font-bold text-slate-900">
            Baloeng Gedhe
          </h1>

          <p className="text-slate-500 mt-2">
            Manufacturing Operating System
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">
              Email Admin
            </label>

            <input
              autoComplete="off"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email admin"
              className="w-full h-14 px-6 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">
              Password
            </label>

            <input
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full h-14 px-6 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
              required
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4"
              />
              Remember Me
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-red-600 hover:text-red-700 font-semibold transition"
            >
              Lupa Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 text-white rounded-xl font-semibold shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-slate-400 cursor-not-allowed shadow-none"
                : "bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-red-600/10 hover:shadow-lg"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
          {supabaseActive ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Supabase Terkoneksi (Auth Aktif)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Demo Mode Aktif (Gunakan kredensial acak)
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
