import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import { ADMIN_EMAIL_DOMAIN } from '../../lib/constants'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000

function getLockoutState() {
  try {
    const raw = sessionStorage.getItem('cfa_login_lockout')
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 }
  } catch {
    return { attempts: 0, lockedUntil: 0 }
  }
}

function saveLockoutState(state) {
  sessionStorage.setItem('cfa_login_lockout', JSON.stringify(state))
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const infoMessage = location.state?.message ?? ''
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const lockout = getLockoutState()
    if (Date.now() < lockout.lockedUntil) {
      const remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 60000)
      setError(`Trop de tentatives. Réessayez dans ${remaining} minute(s).`)
      return
    }

    const cleanPseudo = pseudo.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '').slice(0, 64)
    if (!cleanPseudo || password.length < 1 || password.length > 128) {
      setError('Identifiants invalides.')
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: cleanPseudo + ADMIN_EMAIL_DOMAIN,
      password,
    })

    if (authError) {
      const state = getLockoutState()
      const newAttempts = (state.attempts || 0) + 1
      saveLockoutState({
        attempts: newAttempts,
        lockedUntil: newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
      })
      setError('Pseudo ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    saveLockoutState({ attempts: 0, lockedUntil: 0 })
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/blason.png" alt="Blason d'Argueil" className="h-20 mx-auto mb-4 drop-shadow" />
          <h1
            className="text-[#1E3A8A] text-4xl tracking-widest"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Espace Admin
          </h1>
          <p className="text-[#4A5580] text-sm mt-1">Comité des Fêtes d'Argueil</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-5 border border-[#D4DBF0]"
          autoComplete="off"
        >
          {infoMessage && (
            <div className="bg-blue-50 border border-[#1E3A8A]/30 text-[#1E3A8A] rounded-lg px-4 py-3 text-sm text-center" role="status">
              {infoMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="pseudo" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Pseudo</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BCC8E8]" />
              <input
                id="pseudo"
                type="text"
                required
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                maxLength={64}
                className="w-full border border-[#D4DBF0] rounded-lg pl-9 pr-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
                placeholder="Votre pseudo"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BCC8E8]" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={128}
                className="w-full border border-[#D4DBF0] rounded-lg pl-9 pr-10 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
                placeholder="Votre mot de passe"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BCC8E8] hover:text-[#4A5580] cursor-pointer"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E3A8A] text-white font-semibold py-3 rounded-lg hover:bg-[#2B52C8] transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-6">
          <a href="/" className="text-xs text-[#BCC8E8] hover:text-[#4A5580] transition-colors cursor-pointer">
            ← Retour au site
          </a>
        </p>
      </div>
    </div>
  )
}
