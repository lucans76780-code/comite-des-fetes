import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, PlusCircle, Trash2, Upload, ExternalLink, Building2 } from 'lucide-react'

const emptyForm = { nom: '', lieu: '', lien: '' }

function isSafeUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export default function AdminPartners() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef(null)
  const timerRef = useRef(null)

  const fetchPartners = async () => {
    const { data } = await supabase.from('partners').select('*').order('created_at', { ascending: true })
    setPartners(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPartners()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.nom.trim().length < 2) { setError('Le nom du partenaire est trop court.'); return }
    if (form.lien && !isSafeUrl(form.lien)) { setError('Le lien doit être une URL valide (https:// ou http://).'); return }
    setSubmitting(true)

    let photo_url = ''

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadErr } = await supabase.storage.from('partners').upload(path, photoFile)
      if (uploadErr) {
        setError('Erreur lors de l\'upload de la photo.')
        setSubmitting(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('partners').getPublicUrl(path)
      photo_url = publicUrl
    }

    const { error: err } = await supabase.from('partners').insert([{ ...form, photo_url }])

    if (err) {
      setError('Erreur lors de l\'ajout du partenaire.')
    } else {
      setSuccess(`"${form.nom}" a été ajouté comme partenaire.`)
      setForm(emptyForm)
      setPhotoFile(null)
      if (photoPreview) URL.revokeObjectURL(photoPreview)
      setPhotoPreview('')
      fetchPartners()
      timerRef.current = setTimeout(() => setSuccess(''), 5000)
    }
    setSubmitting(false)
  }

  const handleDelete = async (partner) => {
    if (!window.confirm(`Supprimer le partenaire "${partner.nom}" ?`)) return

    if (partner.photo_url) {
      const url = new URL(partner.photo_url)
      const pathParts = url.pathname.split('/object/public/partners/')
      if (pathParts[1]) {
        await supabase.storage.from('partners').remove([pathParts[1]])
      }
    }
    await supabase.from('partners').delete().eq('id', partner.id)
    fetchPartners()
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <header className="bg-[#1E3A8A] text-white px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/admin" className="text-[#BCC8E8] hover:text-white transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Partenaires
            </h1>
            <p className="text-[#BCC8E8] text-sm">Gérer les partenaires du comité</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Formulaire ajout */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#D4DBF0]">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5 flex items-center gap-2">
            <PlusCircle size={20} /> Ajouter un partenaire
          </h2>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
          {success && <div className="bg-blue-50 border border-[#1E3A8A]/30 text-[#1E3A8A] rounded-lg px-4 py-3 mb-4 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="nom" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Nom du partenaire *</label>
                <input
                  id="nom" name="nom" type="text" required value={form.nom} onChange={handleChange}
                  className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
                  placeholder="Ex : Mairie d'Argueil, Crédit Agricole…"
                />
              </div>
              <div>
                <label htmlFor="lieu" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Lieu / Ville</label>
                <input
                  id="lieu" name="lieu" type="text" value={form.lieu} onChange={handleChange}
                  className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
                  placeholder="Ex : Argueil, Forges-les-Eaux…"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lien" className="block text-sm font-semibold text-[#1E3A8A] mb-1">Lien (site web)</label>
              <input
                id="lien" name="lien" type="url" value={form.lien} onChange={handleChange}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition text-sm"
                placeholder="https://www.exemple.fr"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Logo / Photo</label>
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border-2 border-dashed border-[#D4DBF0] hover:border-[#1E3A8A] rounded-xl px-5 py-3 text-sm text-[#4A5580] hover:text-[#1E3A8A] transition-colors cursor-pointer"
                >
                  <Upload size={16} />
                  Choisir une image
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />

                {photoPreview && (
                  <div className="relative w-20 h-20">
                    <img src={photoPreview} alt="Aperçu" className="w-full h-full object-contain rounded-lg shadow border border-[#D4DBF0]" />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview('') }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer text-xs"
                    >×</button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-[#1E3A8A] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#2B52C8] transition-colors cursor-pointer disabled:opacity-60 text-sm"
            >
              <PlusCircle size={16} />
              {submitting ? 'Ajout…' : 'Ajouter le partenaire'}
            </button>
          </form>
        </div>

        {/* Liste des partenaires */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#D4DBF0]">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5">Partenaires actuels</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : partners.length === 0 ? (
            <p className="text-[#4A5580] text-center py-8">Aucun partenaire enregistré.</p>
          ) : (
            <div className="divide-y divide-[#F8F7F2]">
              {partners.map((partner) => (
                <div key={partner.id} className="flex items-center gap-4 py-4">
                  {partner.photo_url ? (
                    <img
                      src={partner.photo_url}
                      alt={partner.nom}
                      className="w-14 h-14 object-contain rounded-lg border border-[#D4DBF0] bg-white shrink-0 p-1"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-[#F8F7F2] rounded-lg border border-[#D4DBF0] flex items-center justify-center shrink-0">
                      <Building2 size={22} className="text-[#BCC8E8]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A2640] text-sm">{partner.nom}</p>
                    {partner.lieu && <p className="text-[#4A5580] text-xs">{partner.lieu}</p>}
                    {partner.lien && isSafeUrl(partner.lien) && (
                      <a
                        href={partner.lien}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-1 text-[#1E3A8A] text-xs hover:underline cursor-pointer mt-0.5"
                      >
                        <ExternalLink size={10} />
                        {partner.lien.slice(0, 50)}{partner.lien.length > 50 ? '…' : ''}
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(partner)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
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
