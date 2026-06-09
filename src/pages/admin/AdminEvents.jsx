import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, PlusCircle, Trash2, CalendarDays, MapPin, Upload, ExternalLink, Pencil, X } from 'lucide-react'
import { googleMapsUrl } from '../../lib/maps'

const RESUME_MAX = 800
const emptyForm = { nom: '', date: '', lieu: '', resume: '', affiche_url: '' }

function toDateInputValue(dateStr) {
  if (!dateStr) return ''
  return String(dateStr).slice(0, 10)
}

async function removePosterFromStorage(afficheUrl) {
  if (!afficheUrl) return
  try {
    const url = new URL(afficheUrl)
    const pathParts = url.pathname.split('/object/public/events-posters/')
    if (pathParts[1]) {
      await supabase.storage.from('events-posters').remove([pathParts[1]])
    }
  } catch {
    /* ignore */
  }
}

function validateEventForm(form) {
  if (!form.nom.trim()) return "Le nom de l'événement est requis."
  if (form.nom.trim().length < 2) return 'Le nom est trop court.'
  if (!form.date) return 'La date est requise.'
  if (!form.lieu.trim()) return 'Le lieu est requis.'
  if (form.resume.trim() && form.resume.trim().length < 30) {
    return 'Le résumé doit contenir au moins 30 caractères (ou laissez vide).'
  }
  return null
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [afficheFile, setAfficheFile] = useState(null)
  const [affichePreview, setAffichePreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef(null)
  const timerRef = useRef(null)
  const formRef = useRef(null)
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

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setAfficheFile(null)
    if (affichePreviewRef.current) URL.revokeObjectURL(affichePreviewRef.current)
    affichePreviewRef.current = ''
    setAffichePreview('')
    if (fileRef.current) fileRef.current.value = ''
  }

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

  const clearAfficheSelection = (keepExisting = false) => {
    setAfficheFile(null)
    if (affichePreviewRef.current) URL.revokeObjectURL(affichePreviewRef.current)
    affichePreviewRef.current = ''
    setAffichePreview(keepExisting && form.affiche_url ? form.affiche_url : '')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleEdit = (event) => {
    setError('')
    setSuccess('')
    setEditingId(event.id)
    setForm({
      nom: event.nom ?? '',
      date: toDateInputValue(event.date),
      lieu: event.lieu ?? '',
      resume: event.resume ?? '',
      affiche_url: event.affiche_url ?? '',
    })
    clearAfficheSelection()
    if (event.affiche_url) setAffichePreview(event.affiche_url)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelEdit = () => {
    setError('')
    resetForm()
  }

  const uploadAffiche = async () => {
    const ext = afficheFile.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('events-posters').upload(path, afficheFile)
    if (uploadErr) return { error: uploadErr }
    const { data: { publicUrl } } = supabase.storage.from('events-posters').getPublicUrl(path)
    return { url: publicUrl }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateEventForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)

    let affiche_url = editingId ? (form.affiche_url || '') : ''
    const previousAfficheUrl = form.affiche_url

    if (afficheFile) {
      const upload = await uploadAffiche()
      if (upload.error) {
        setError("Erreur lors de l'upload de l'affiche.")
        setSubmitting(false)
        return
      }
      affiche_url = upload.url
      if (editingId && previousAfficheUrl && previousAfficheUrl !== affiche_url) {
        await removePosterFromStorage(previousAfficheUrl)
      }
    }

    const payload = {
      nom: form.nom.trim(),
      date: form.date,
      lieu: form.lieu.trim(),
      resume: form.resume.trim() || null,
      affiche_url,
    }

    const { error: err } = editingId
      ? await supabase.from('events').update(payload).eq('id', editingId)
      : await supabase.from('events').insert([payload])

    if (err) {
      setError(editingId ? "Erreur lors de la modification de l'événement." : "Erreur lors de l'ajout de l'événement.")
    } else {
      setSuccess(
        editingId
          ? `L'événement "${form.nom}" a été modifié avec succès.`
          : `L'événement "${form.nom}" a été publié avec succès.`
      )
      resetForm()
      fetchEvents()
      timerRef.current = setTimeout(() => setSuccess(''), 5000)
    }
    setSubmitting(false)
  }

  const handleDelete = async (event) => {
    if (!window.confirm(`Supprimer l'événement "${event.nom}" ?`)) return
    if (editingId === event.id) resetForm()
    await removePosterFromStorage(event.affiche_url)
    await supabase.from('events').delete().eq('id', event.id)
    fetchEvents()
  }

  const isEditing = Boolean(editingId)

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
        <div ref={formRef} className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5 flex items-center gap-2">
            {isEditing ? <Pencil size={20} /> : <PlusCircle size={20} />}
            {isEditing ? 'Modifier l\'événement' : 'Ajouter un événement'}
          </h2>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nom" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Nom de l&apos;événement *</label>
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

            <div>
              <label htmlFor="resume" className="block text-sm font-semibold text-[#1E3A8A] mb-1">
                Résumé de l&apos;événement{' '}
                <span className="text-[#4A5580] font-normal">(recommandé pour le référencement)</span>
              </label>
              <textarea
                id="resume"
                name="resume"
                rows={4}
                value={form.resume}
                onChange={handleChange}
                maxLength={RESUME_MAX}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition text-sm resize-none"
                placeholder="Décrivez l'événement : type d'animation, public visé, lieu à Argueil… (min. 30 caractères si renseigné)"
              />
              <p className="text-xs text-[#4A5580] mt-1">
                {form.resume.length}/{RESUME_MAX} — Ce texte apparaît sur le site et aide Google à référencer
                l&apos;événement. Mentionnez « Argueil » et le type de festivité.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">
                Affiche {isEditing ? '(remplacer l\'image actuelle)' : '(optionnel)'}
              </label>
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border-2 border-dashed border-[#D4DBF0] hover:border-[#C9A227] rounded-xl px-5 py-4 text-sm text-[#4A5580] hover:text-[#1E3A8A] transition-colors cursor-pointer"
                >
                  <Upload size={18} />
                  {isEditing ? 'Nouvelle affiche' : 'Choisir une image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAfficheSelect} />

                {affichePreview && (
                  <div className="relative w-24 h-32">
                    <img src={affichePreview} alt="Aperçu affiche" className="w-full h-full object-contain rounded-lg shadow bg-[#F0F4FF]" />
                    <button
                      type="button"
                      onClick={() => clearAfficheSelection(isEditing)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer text-xs"
                      aria-label="Retirer l'aperçu"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              {isEditing && form.affiche_url && !afficheFile && (
                <p className="text-xs text-[#4A5580] mt-2">L&apos;affiche actuelle est conservée si vous n&apos;en choisissez pas une nouvelle.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#1E3A8A] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#C9A227] transition-colors cursor-pointer disabled:opacity-60 text-sm"
              >
                {isEditing ? <Pencil size={16} /> : <PlusCircle size={16} />}
                {submitting
                  ? (isEditing ? 'Enregistrement…' : 'Publication…')
                  : (isEditing ? 'Enregistrer les modifications' : 'Publier l\'événement')}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 border border-[#D4DBF0] text-[#4A5580] font-semibold px-6 py-3 rounded-lg hover:bg-[#F8F7F2] transition-colors cursor-pointer text-sm"
                >
                  <X size={16} />
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

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
                const isActive = editingId === event.id
                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-4 py-4 ${isActive ? 'bg-[#F0F4FF]/60 -mx-2 px-2 rounded-lg' : ''}`}
                  >
                    {event.affiche_url ? (
                      <img src={event.affiche_url} alt="" className="w-12 h-16 object-contain rounded-lg shadow-sm shrink-0 bg-[#F0F4FF]" />
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
                        {isActive && (
                          <span className="ml-2 text-xs bg-[#C9A227]/20 text-[#1A2640] px-2 py-0.5 rounded-full">En édition</span>
                        )}
                      </p>
                      {event.resume && (
                        <p className="text-xs text-[#4A5580] mt-1 line-clamp-2">{event.resume}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#4A5580]">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <a
                          href={googleMapsUrl(event.lieu)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-[#1E3A8A] underline cursor-pointer"
                        >
                          <MapPin size={11} />
                          {event.lieu}
                          <ExternalLink size={10} className="opacity-60" />
                        </a>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-[#1E3A8A] hover:bg-[#1E3A8A]/10 rounded-lg transition-colors cursor-pointer"
                        aria-label="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
