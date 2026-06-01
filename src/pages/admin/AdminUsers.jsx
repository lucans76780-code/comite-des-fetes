import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, UserPlus, Trash2, Shield, Eye, EyeOff, KeyRound, Pencil } from 'lucide-react'
import { ADMIN_EMAIL_DOMAIN } from '../../lib/constants'

export default function AdminUsers() {
  const { admin: currentAdmin } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // Création d'un nouveau compte
  const [newPseudo, setNewPseudo] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  // Changement de son propre mot de passe
  const [ownPassword, setOwnPassword] = useState('')
  const [showOwnPassword, setShowOwnPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  // Changement de pseudo
  const [newPseudoSelf, setNewPseudoSelf] = useState('')
  const [changingPseudo, setChangingPseudo] = useState(false)
  const [pseudoSuccess, setPseudoSuccess] = useState('')
  const [pseudoError, setPseudoError] = useState('')

  const addTimerRef = useRef(null)
  const pwTimerRef = useRef(null)
  const pseudoTimerRef = useRef(null)

  const fetchAccounts = useCallback(async () => {
    const { data } = await supabase
      .from('admin_accounts')
      .select('id, pseudo, email, created_at')
      .order('created_at', { ascending: true })
    setAccounts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAccounts()
    return () => {
      if (addTimerRef.current) clearTimeout(addTimerRef.current)
      if (pwTimerRef.current) clearTimeout(pwTimerRef.current)
      if (pseudoTimerRef.current) clearTimeout(pseudoTimerRef.current)
    }
  }, [fetchAccounts])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    setAddError('')
    setAddSuccess('')

    const pseudoClean = newPseudo.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '').slice(0, 64)
    const emailInternal = pseudoClean + ADMIN_EMAIL_DOMAIN

    if (!pseudoClean || pseudoClean.length < 2) {
      setAddError('Le pseudo doit contenir au moins 2 caractères (lettres, chiffres, - ou _).')
      setAdding(false)
      return
    }
    if (newPassword.length < 6) {
      setAddError('Le mot de passe doit contenir au moins 6 caractères.')
      setAdding(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailInternal,
      password: newPassword,
      options: { data: { pseudo: pseudoClean } },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setAddError('Ce pseudo est déjà utilisé.')
      } else {
        setAddError(`Erreur : ${signUpError.message}`)
      }
      setAdding(false)
      return
    }

    if (data.user) {
      await supabase.from('admin_accounts').insert([{
        id: data.user.id,
        pseudo: pseudoClean,
        email: emailInternal,
      }])
      setAddSuccess(`Le compte "${pseudoClean}" a été créé.`)
    } else {
      // data.user est null si la confirmation email est activée dans Supabase.
      // Le compte auth existe mais doit confirmer avant d'apparaître ici.
      setAddSuccess(`Compte "${pseudoClean}" créé — en attente de confirmation email interne.`)
    }
    setNewPseudo('')
    setNewPassword('')
    fetchAccounts()
    addTimerRef.current = setTimeout(() => setAddSuccess(''), 6000)
    setAdding(false)
  }

  const handleDelete = async (account) => {
    if (account.id === currentAdmin?.id) {
      setAddError('Vous ne pouvez pas supprimer votre propre compte.')
      addTimerRef.current = setTimeout(() => setAddError(''), 4000)
      return
    }
    if (!window.confirm(`Supprimer le compte "${account.pseudo}" ?`)) return

    const { error } = await supabase.from('admin_accounts').delete().eq('id', account.id)
    if (error) {
      setAddError('Erreur lors de la suppression.')
      return
    }
    fetchAccounts()
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (ownPassword.length < 6) {
      setPwError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setChangingPassword(true)
    setPwError('')
    setPwSuccess('')

    const { error } = await supabase.auth.updateUser({ password: ownPassword })

    if (error) {
      setPwError('Erreur lors du changement de mot de passe.')
    } else {
      setPwSuccess('Mot de passe modifié avec succès.')
      setOwnPassword('')
      pwTimerRef.current = setTimeout(() => setPwSuccess(''), 5000)
    }
    setChangingPassword(false)
  }

  const handleChangePseudo = async (e) => {
    e.preventDefault()
    const cleanPseudo = newPseudoSelf.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '').slice(0, 64)
    if (cleanPseudo.length < 2) {
      setPseudoError('Le pseudo doit contenir au moins 2 caractères (lettres, chiffres, - ou _).')
      return
    }
    setChangingPseudo(true)
    setPseudoError('')
    setPseudoSuccess('')

    const newEmail = cleanPseudo + ADMIN_EMAIL_DOMAIN

    const { error: authErr } = await supabase.auth.updateUser({
      email: newEmail,
      data: { pseudo: cleanPseudo },
    })

    if (authErr) {
      setPseudoError('Erreur lors du changement de pseudo.')
      setChangingPseudo(false)
      return
    }

    const { error: dbErr } = await supabase
      .from('admin_accounts')
      .update({ pseudo: cleanPseudo, email: newEmail })
      .eq('id', currentAdmin.id)

    if (dbErr) {
      setPseudoError('Pseudo mis à jour dans auth mais erreur en base.')
    } else {
      setPseudoSuccess(`Pseudo changé en "${cleanPseudo}" avec succès.`)
      setNewPseudoSelf('')
      fetchAccounts()
      pseudoTimerRef.current = setTimeout(() => setPseudoSuccess(''), 5000)
    }
    setChangingPseudo(false)
  }

  const currentPseudo = currentAdmin?.user_metadata?.pseudo ?? currentAdmin?.email ?? '—'

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <header className="bg-[#1E3A8A] text-white px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/admin" className="text-[#BCC8E8] hover:text-white transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Gestion des utilisateurs
            </h1>
            <p className="text-[#BCC8E8] text-sm">Comptes administrateurs</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Changer son propre mot de passe */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#D4DBF0]">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5 flex items-center gap-2">
            <KeyRound size={20} /> Mon mot de passe
          </h2>
          <p className="text-[#4A5580] text-sm mb-4">
            Connecté en tant que <strong className="text-[#1E3A8A]">{currentPseudo}</strong>
          </p>

          {pwError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">{pwError}</div>}
          {pwSuccess && <div className="bg-blue-50 border border-[#1E3A8A]/30 text-[#1E3A8A] rounded-lg px-4 py-3 mb-4 text-sm" role="status">{pwSuccess}</div>}

          <form onSubmit={handleChangePassword} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type={showOwnPassword ? 'text' : 'password'}
                required
                value={ownPassword}
                onChange={(e) => setOwnPassword(e.target.value)}
                placeholder="Nouveau mot de passe (6 car. min)"
                minLength={6}
                maxLength={128}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 pr-10 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowOwnPassword(!showOwnPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BCC8E8] hover:text-[#4A5580] cursor-pointer"
                aria-label={showOwnPassword ? 'Masquer' : 'Afficher'}
              >
                {showOwnPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 bg-[#1E3A8A] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#2B52C8] transition-colors cursor-pointer disabled:opacity-60 text-sm whitespace-nowrap"
            >
              {changingPassword ? 'Modification…' : 'Modifier'}
            </button>
          </form>
        </div>

        {/* Changer son pseudo */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#D4DBF0]">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5 flex items-center gap-2">
            <Pencil size={20} /> Mon pseudo
          </h2>
          <p className="text-[#4A5580] text-sm mb-4">
            Pseudo actuel : <strong className="text-[#1E3A8A]">{currentPseudo}</strong>
          </p>

          {pseudoError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">{pseudoError}</div>}
          {pseudoSuccess && <div className="bg-blue-50 border border-[#1E3A8A]/30 text-[#1E3A8A] rounded-lg px-4 py-3 mb-4 text-sm" role="status">{pseudoSuccess}</div>}

          <form onSubmit={handleChangePseudo} className="flex gap-3">
            <input
              type="text"
              required
              value={newPseudoSelf}
              onChange={(e) => setNewPseudoSelf(e.target.value)}
              placeholder="Nouveau pseudo (lettres, chiffres, - ou _)"
              minLength={2}
              maxLength={64}
              className="flex-1 border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
            />
            <button
              type="submit"
              disabled={changingPseudo}
              className="flex items-center gap-2 bg-[#1E3A8A] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#2B52C8] transition-colors cursor-pointer disabled:opacity-60 text-sm whitespace-nowrap"
            >
              {changingPseudo ? 'Modification…' : 'Modifier'}
            </button>
          </form>
        </div>

        {/* Créer un nouveau compte */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#D4DBF0]">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-2 flex items-center gap-2">
            <UserPlus size={20} /> Créer un compte
          </h2>
          <p className="text-[#4A5580] text-xs mb-5">
            ℹ️ Si la confirmation email est activée dans Supabase, le nouveau compte devra confirmer son adresse avant de pouvoir se connecter.
          </p>

          {addError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">{addError}</div>}
          {addSuccess && <div className="bg-blue-50 border border-[#1E3A8A]/30 text-[#1E3A8A] rounded-lg px-4 py-3 mb-4 text-sm" role="status">{addSuccess}</div>}

          <form onSubmit={handleAdd} className="space-y-3">
            <input
              type="text"
              required
              value={newPseudo}
              onChange={(e) => setNewPseudo(e.target.value)}
              placeholder="Pseudo *"
              maxLength={64}
              className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
            />

            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  maxLength={128}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mot de passe * (6 car. min)"
                  className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 pr-10 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BCC8E8] hover:text-[#4A5580] cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-2 bg-[#1E3A8A] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#2B52C8] transition-colors cursor-pointer disabled:opacity-60 text-sm whitespace-nowrap"
              >
                <UserPlus size={16} />
                {adding ? 'Création…' : 'Créer'}
              </button>
            </div>
          </form>
        </div>

        {/* Liste des comptes */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#D4DBF0]">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5 flex items-center gap-2">
            <Shield size={20} /> Comptes existants
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-[#4A5580] text-center py-8">Aucun compte enregistré.</p>
          ) : (
            <div className="divide-y divide-[#F8F7F2]">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                      <Shield size={16} className="text-[#1E3A8A]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A2640] text-sm">
                        {account.pseudo}
                        {account.id === currentAdmin?.id && (
                          <span className="ml-2 text-xs bg-[#1E3A8A]/10 text-[#1E3A8A] px-2 py-0.5 rounded-full">Vous</span>
                        )}
                      </p>
                      <p className="text-[#4A5580] text-xs">
                        Créé le {new Date(account.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(account)}
                    disabled={account.id === currentAdmin?.id}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
