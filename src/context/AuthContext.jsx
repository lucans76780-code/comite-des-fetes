import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  const verifyAndSetAdmin = useCallback(async (user) => {
    if (!user) {
      setAdmin(null)
      setLoading(false)
      return
    }
    // Vérifie que l'utilisateur a bien un profil admin actif (sécurité : un compte
    // supprimé de admin_accounts ne doit plus pouvoir accéder au panel)
    const { data } = await supabase
      .from('admin_accounts')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    setAdmin(data ? user : null)
    setLoading(false)
  }, [])

  useEffect(() => {
    // onAuthStateChange gère à la fois le montage initial et les changements suivants.
    // On n'utilise pas getSession() séparément pour éviter une race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      verifyAndSetAdmin(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [verifyAndSetAdmin])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ admin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
