import React, { useState, useEffect } from "react"
import bgLogo from "../assets/images/bg_logo_1779866363731.png"

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("Email Admin tidak boleh kosong!")
      return
    }
    if (!password) {
      setError("Password tidak boleh kosong!")
      return
    }
    
    if (rememberMe) {
      localStorage.setItem("rememberEmail", email)
    } else {
      localStorage.removeItem("rememberEmail")
      localStorage.removeItem("rememberPassword")
    }

    setError("")
    onLogin()
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
            className="w-full h-12 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-semibold shadow-md shadow-red-600/10 hover:shadow-lg transition cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
