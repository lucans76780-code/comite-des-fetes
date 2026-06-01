import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, PlusCircle, Trash2, CalendarDays, MapPin, Upload } from 'lucide-react'

const emptyForm = { nom: '', date: '', lieu: '', affiche_url: '' }

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [afficheFile, setAfficheFile] = useState(null)
  const [affichePreview, setAffichePreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef(null)
  const timerRef = useRef(null)

  const affichePreviewRef = useRef('')

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true })
    setEvents(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (affichePreviewRef.current) URL.revokeObjectURL(affichePreviewRef.current)
    }
  }, [fetchEvents])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAfficheSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (affichePreviewRef.current) URL.revokeObjectURL(affichePreviewRef.current)
    const url = URL.createObjectURL(file)
    affichePreviewRef.current = url
    setAfficheFile(file)
    setAffichePreview(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.nom.trim()) { setError("Le nom de l'événement est requis."); return }
    if (form.nom.trim().length < 2) { setError("Le nom est trop court."); return }
    if (!form.date) { setError("La date est requise."); return }
    if (!form.lieu.trim()) { setError("Le lieu est requis."); return }
    setSubmitting(true)

    let affiche_url = ''

    if (afficheFile) {
      const ext = afficheFile.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadErr } = await supabase.storage.from('events-posters').upload(path, afficheFile)
      if (uploadErr) {
        setError('Erreur lors de l\'upload de l\'affiche.')
        setSubmitting(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('events-posters').getPublicUrl(path)
      affiche_url = publicUrl
    }

    const { error: err } = await supabase.from('events').insert([{ ...form, affiche_url }])

    if (err) {
      setError('Erreur lors de l\'ajout de l\'événement.')
    } else {
      setSuccess(`L'événement "${form.nom}" a été publié avec succès.`)
      setForm(emptyForm)
      setAfficheFile(null)
      if (affichePreviewRef.current) URL.revokeObjectURL(affichePreviewRef.current)
      affichePreviewRef.current = ''
      setAffichePreview('')
      fetchEvents()
      timerRef.current = setTimeout(() => setSuccess(''), 5000)
    }
    setSubmitting(false)
  }

  const handleDelete = async (event) => {
    if (!window.confirm(`Supprimer l'événement "${event.nom}" ?`)) return

    if (event.affiche_url) {
      const url = new URL(event.affiche_url)
      const pathParts = url.pathname.split('/object/public/events-posters/')
      if (pathParts[1]) {
        await supabase.storage.from('events-posters').remove([pathParts[1]])
      }
    }
    await supabase.from('events').delete().eq('id', event.id)
    fetchEvents()
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <header className="bg-[#1E3A8A] text-white px-6 py-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link to="/admin" className="text-[#D4DBF0] hover:text-white transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Événements
            </h1>
            <p className="text-[#D4DBF0] text-sm">Publier et gérer les événements</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Formulaire ajout */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5 flex items-center gap-2">
            <PlusCircle size={20} /> Ajouter un événement
          </h2>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nom" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Nom de l'événement *</label>
              <input
                id="nom" name="nom" type="text" required value={form.nom} onChange={handleChange}
                maxLength={120}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition text-sm"
                placeholder="Ex : Fête de la Saint-Jean"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Date *</label>
                <input
                  id="date" name="date" type="date" required value={form.date} onChange={handleChange}
                  className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition text-sm"
                />
              </div>
              <div>
                <label htmlFor="lieu" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Lieu *</label>
                <input
                  id="lieu" name="lieu" type="text" required value={form.lieu} onChange={handleChange}
                  maxLength={120}
                  className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition text-sm"
                  placeholder="Salle des Fêtes, Place de l'Église…"
                />
              </div>
            </div>

            {/* Affiche */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Affiche (optionnel)</label>
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border-2 border-dashed border-[#D4DBF0] hover:border-[#C9A227] rounded-xl px-5 py-4 text-sm text-[#4A5580] hover:text-[#1E3A8A] transition-colors cursor-pointer"
                >
                  <Upload size={18} />
                  Choisir une image
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAfficheSelect} />

                {affichePreview && (
                  <div className="relative w-24 h-32">
                    <img src={affichePreview} alt="Aperçu affiche" className="w-full h-full object-cover rounded-lg shadow" />
                    <button
                      type="button"
                      onClick={() => { setAfficheFile(null); setAffichePreview('') }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-[#1E3A8A] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#C9A227] transition-colors cursor-pointer disabled:opacity-60 text-sm"
            >
              <PlusCircle size={16} />
              {submitting ? 'Publication…' : 'Publier l\'événement'}
            </button>
          </form>
        </div>

        {/* Liste des événements */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5">Tous les événements</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-[#4A5580] text-center py-8">Aucun événement publié.</p>
          ) : (
            <div className="divide-y divide-[#F8F7F2]">
              {events.map((event) => {
                const isPast = new Date(event.date) < new Date()
                return (
                  <div key={event.id} className="flex items-center gap-4 py-4">
                    {event.affiche_url ? (
                      <img src={event.affiche_url} alt="" className="w-12 h-16 object-cover rounded-lg shadow-sm shrink-0" />
                    ) : (
                      <div className="w-12 h-16 bg-[#F8F7F2] rounded-lg flex items-center justify-center shrink-0">
                        <CalendarDays size={20} className="text-[#D4DBF0]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1A2640] text-sm truncate">
                        {event.nom}
                        {isPast && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Passé</span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#4A5580]">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {event.lieu}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(event)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

