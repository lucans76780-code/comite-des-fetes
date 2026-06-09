import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import Hero from '../../components/Hero'
import FormPrivacyNotice from '../../components/FormPrivacyNotice'
import { Send, CheckCircle, Lightbulb } from 'lucide-react'

const LIMITS = { nom: 60, prenom: 60, email: 120, telephone: 20, suggestion: 2000 }

const emptyForm = { nom: '', prenom: '', email: '', telephone: '', suggestion: '' }

function validateForm(form) {
  if (!form.nom.trim()) return 'Le nom est requis.'
  if (!form.prenom.trim()) return 'Le prénom est requis.'
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!emailRe.test(form.email)) return 'L\'adresse email est invalide.'
  if (form.telephone && !/^[\d\s\+\-\(\)\.]{7,20}$/.test(form.telephone)) return 'Le numéro de téléphone est invalide.'
  if (form.suggestion.trim().length < 10) return 'La suggestion doit contenir au moins 10 caractères.'
  return null
}

export default function Suggestions() {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    const max = LIMITS[name] ?? 500
    setForm((prev) => ({ ...prev, [name]: value.slice(0, max) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm(form)
    if (validationError) { setError(validationError); return }

    setSubmitting(true)

    const sanitized = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim().toLowerCase(),
      telephone: form.telephone.trim() || null,
      suggestion: form.suggestion.trim(),
    }

    const { error: err } = await supabase.from('suggestions').insert([sanitized])

    if (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } else {
      setSuccess(true)
      setForm(emptyForm)
      timerRef.current = setTimeout(() => setSuccess(false), 6000)
    }
    setSubmitting(false)
  }

  return (
    <div>
      <Hero title="Vos suggestions" subtitle="Votre avis compte pour nous" />

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-start gap-4 border border-[#D4DBF0] rounded-xl p-6 mb-10"
          style={{ background: 'rgba(30,58,138,0.05)' }}>
          <Lightbulb className="text-[#C9A227] shrink-0 mt-0.5" size={28} />
          <div>
            <h3 className="text-[#1E3A8A] font-semibold text-lg mb-1">Partagez vos idées !</h3>
            <p className="text-[#4A5580] leading-relaxed text-sm">
              Le Comité des Fêtes est à l'écoute de toutes vos suggestions. Fête thématique,
              activité sportive, manifestation culturelle… Toutes les idées sont les bienvenues !
              Votre suggestion sera examinée par nos bénévoles.
            </p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-3 bg-blue-50 border border-[#1E3A8A] text-[#1E3A8A] rounded-lg px-5 py-4 mb-6" role="status">
            <CheckCircle size={20} />
            <span className="font-semibold">Merci pour votre suggestion ! Nous en prendrons connaissance prochainement.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-4 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-5 border border-[#D4DBF0]" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="nom" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Nom *</label>
              <input id="nom" name="nom" type="text" required value={form.nom} onChange={handleChange} maxLength={LIMITS.nom}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition"
                placeholder="Dupont" autoComplete="family-name" />
            </div>
            <div>
              <label htmlFor="prenom" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Prénom *</label>
              <input id="prenom" name="prenom" type="text" required value={form.prenom} onChange={handleChange} maxLength={LIMITS.prenom}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition"
                placeholder="Marie" autoComplete="given-name" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Email *</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} maxLength={LIMITS.email}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition"
                placeholder="marie.dupont@email.fr" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="telephone" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Téléphone</label>
              <input id="telephone" name="telephone" type="tel" value={form.telephone} onChange={handleChange} maxLength={LIMITS.telephone}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition"
                placeholder="06 12 34 56 78" autoComplete="tel" />
            </div>
          </div>

          <div>
            <label htmlFor="suggestion" className="block text-sm font-semibold text-[#1E3A8A] mb-1">
              Votre suggestion * <span className="text-[#BCC8E8] font-normal text-xs">({form.suggestion.length}/{LIMITS.suggestion})</span>
            </label>
            <textarea id="suggestion" name="suggestion" required rows={5} value={form.suggestion} onChange={handleChange} maxLength={LIMITS.suggestion}
              className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition resize-none"
              placeholder="Décrivez votre idée en quelques lignes…" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#1E3A8A] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#2B52C8] transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <Send size={18} />
            {submitting ? 'Envoi en cours…' : 'Envoyer ma suggestion'}
          </button>
          <FormPrivacyNotice />
        </form>
      </section>
    </div>
  )
}
