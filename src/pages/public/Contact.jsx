import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import Hero from '../../components/Hero'
import FormPrivacyNotice from '../../components/FormPrivacyNotice'
import { Send, CheckCircle, Mail, Phone, MapPin } from 'lucide-react'


const LIMITS = { nom: 60, prenom: 60, email: 120, telephone: 20, sujet: 120, message: 2000 }

const emptyForm = { nom: '', prenom: '', email: '', telephone: '', sujet: '', message: '' }

function validateForm(form) {
  if (!form.nom.trim()) return 'Le nom est requis.'
  if (!form.prenom.trim()) return 'Le prénom est requis.'
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!emailRe.test(form.email)) return 'L\'adresse email est invalide.'
  if (form.telephone && !/^[\d\s\+\-\(\)\.]{7,20}$/.test(form.telephone)) return 'Le numéro de téléphone est invalide.'
  if (!form.sujet.trim()) return 'Le sujet est requis.'
  if (form.message.trim().length < 10) return 'Le message doit contenir au moins 10 caractères.'
  return null
}

export default function Contact() {
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
      sujet: form.sujet.trim(),
      message: form.message.trim(),
    }

    const { error: err } = await supabase.from('contacts').insert([sanitized])

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
      <Hero title="Nous contacter" subtitle="Nous sommes à votre écoute" />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2
                className="text-[#1E3A8A] text-3xl tracking-wide mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Prenez contact
              </h2>
              <p className="text-[#4A5580] leading-relaxed text-sm">
                Une question, une demande de renseignement ou une proposition de partenariat ?
                N'hésitez pas à nous écrire, nous vous répondrons dans les meilleurs délais.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1E3A8A]/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-[#1E3A8A]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A8A] text-sm">Localisation</p>
                  <p className="text-[#4A5580] text-sm">Argueil, Seine-Maritime (76)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1E3A8A]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-[#1E3A8A]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A8A] text-sm">Email</p>
                  <a href="mailto:animargueil@gmail.com" className="text-[#4A5580] text-sm hover:text-[#1E3A8A] underline transition-colors">
                    animargueil@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1E3A8A]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-[#1E3A8A]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A8A] text-sm">Disponibilité</p>
                  <p className="text-[#4A5580] text-sm">Réponse sous 48-72h en semaine</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {success && (
              <div className="flex items-center gap-3 bg-blue-50 border border-[#1E3A8A] text-[#1E3A8A] rounded-lg px-5 py-4 mb-6" role="status">
                <CheckCircle size={20} />
                <span className="font-semibold">Message envoyé ! Nous vous répondrons prochainement.</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-4 mb-6" role="alert">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-5 border border-[#D4DBF0]" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nom" className="block text-sm font-semibold text-[#1E3A8A] mb-1">
                    Nom * <span className="text-[#BCC8E8] font-normal text-xs">({form.nom.length}/{LIMITS.nom})</span>
                  </label>
                  <input id="nom" name="nom" type="text" required value={form.nom} onChange={handleChange} maxLength={LIMITS.nom}
                    className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition"
                    placeholder="Dupont" autoComplete="family-name" />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-semibold text-[#1E3A8A] mb-1">
                    Prénom * <span className="text-[#BCC8E8] font-normal text-xs">({form.prenom.length}/{LIMITS.prenom})</span>
                  </label>
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
                <label htmlFor="sujet" className="block text-sm font-semibold text-[#1E3A8A] mb-1">
                  Sujet * <span className="text-[#BCC8E8] font-normal text-xs">({form.sujet.length}/{LIMITS.sujet})</span>
                </label>
                <input id="sujet" name="sujet" type="text" required value={form.sujet} onChange={handleChange} maxLength={LIMITS.sujet}
                  className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition"
                  placeholder="Ex : Demande de renseignement, Partenariat…" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-[#1E3A8A] mb-1">
                  Message * <span className="text-[#BCC8E8] font-normal text-xs">({form.message.length}/{LIMITS.message})</span>
                </label>
                <textarea id="message" name="message" required rows={5} value={form.message} onChange={handleChange} maxLength={LIMITS.message}
                  className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition resize-none"
                  placeholder="Votre message…" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#1E3A8A] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#2B52C8] transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                <Send size={18} />
                {submitting ? 'Envoi en cours…' : 'Envoyer mon message'}
              </button>
              <FormPrivacyNotice />
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
