import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Upload, Trash2, ImagePlus, X } from 'lucide-react'

function sanitizePathSegment(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\-_]/gi, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .toLowerCase()
}

export default function AdminGallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [nomEvenement, setNomEvenement] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)
  const timerRef = useRef(null)

  const fetchPhotos = async () => {
    const { data, error: err } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!err) setPhotos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPhotos()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleFileSelect = (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    const oversized = arr.filter((f) => f.size > MAX_FILE_SIZE)
    if (oversized.length > 0) {
      setError(`Fichier(s) trop volumineux (max 10 Mo) : ${oversized.map((f) => f.name).join(', ')}`)
      return
    }
    setSelectedFiles(arr)
    setPreviews(arr.map((f) => URL.createObjectURL(f)))
    setError('')
  }

  const handleDrop = (e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files) }

  const removePreview = (idx) => {
    URL.revokeObjectURL(previews[idx])
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!nomEvenement.trim()) { setError("Veuillez saisir le nom de l'événement."); return }
    if (selectedFiles.length === 0) { setError('Veuillez sélectionner au moins une photo.'); return }

    const safeEventName = sanitizePathSegment(nomEvenement)
    if (!safeEventName) { setError('Nom d\'événement invalide (uniquement lettres, chiffres, tirets).'); return }

    setUploading(true)
    setError('')
    setProgress(0)

    let uploaded = 0
    const insertData = []

    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `${safeEventName}/${fileName}`

      const { error: uploadErr } = await supabase.storage.from('gallery').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (uploadErr) {
        setError(`Erreur upload "${file.name}": ${uploadErr.message}`)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path)
      insertData.push({ url: publicUrl, nom_evenement: nomEvenement.trim().slice(0, 120) })

      uploaded++
      setProgress(Math.round((uploaded / selectedFiles.length) * 100))
    }

    const { error: dbErr } = await supabase.from('gallery_photos').insert(insertData)
    if (dbErr) {
      setError("Photos uploadées mais erreur d'enregistrement en base.")
    } else {
      setSuccess(`${uploaded} photo(s) ajoutée(s) avec succès pour "${nomEvenement}".`)
      setNomEvenement('')
      previews.forEach((url) => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setPreviews([])
      setProgress(0)
      fetchPhotos()
      timerRef.current = setTimeout(() => setSuccess(''), 5000)
    }
    setUploading(false)
  }

  const handleDelete = async (photo) => {
    if (!window.confirm('Supprimer cette photo ?')) return

    try {
      const url = new URL(photo.url)
      const pathParts = url.pathname.split('/object/public/gallery/')
      if (pathParts[1]) {
        await supabase.storage.from('gallery').remove([decodeURIComponent(pathParts[1])])
      }
    } catch {
      // URL malformée — on supprime quand même l'entrée DB
    }
    await supabase.from('gallery_photos').delete().eq('id', photo.id)
    fetchPhotos()
  }

  const grouped = photos.reduce((acc, p) => {
    if (!acc[p.nom_evenement]) acc[p.nom_evenement] = []
    acc[p.nom_evenement].push(p)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <header className="bg-[#1E3A8A] text-white px-6 py-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link to="/admin" className="text-[#D4DBF0] hover:text-white transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Galerie photo
            </h1>
            <p className="text-[#D4DBF0] text-sm">Gérer les photos du site</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5 flex items-center gap-2">
            <ImagePlus size={20} /> Ajouter des photos
          </h2>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm" role="status">{success}</div>}

          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label htmlFor="nomEvenement" className="block text-sm font-semibold text-[#1E3A8A] mb-1">
                Nom de l'événement *
              </label>
              <input
                id="nomEvenement"
                type="text"
                value={nomEvenement}
                onChange={(e) => setNomEvenement(e.target.value.slice(0, 120))}
                placeholder="Ex : Fête du Village 2025, Repas Champêtre…"
                maxLength={120}
                className="w-full border border-[#D4DBF0] rounded-lg px-4 py-2.5 text-[#1A2640] focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition text-sm"
              />
            </div>

            <div
              ref={dropRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D4DBF0] hover:border-[#C9A227] rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 bg-[#F8F7F2]/50"
            >
              <Upload size={32} className="text-[#C9A227] mx-auto mb-3" />
              <p className="text-[#1E3A8A] font-semibold">Cliquez ou glissez vos photos ici</p>
              <p className="text-[#4A5580] text-sm mt-1">JPG, PNG, WEBP — max 10 Mo par fichier</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {previews.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#1E3A8A] mb-3">
                  {previews.length} photo(s) sélectionnée(s) :
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square group">
                      <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removePreview(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Retirer cette photo"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploading && (
              <div>
                <div className="flex justify-between text-sm text-[#4A5580] mb-1">
                  <span>Upload en cours…</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-[#D4DBF0] rounded-full h-2">
                  <div
                    className="bg-[#C9A227] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="flex items-center gap-2 bg-[#1E3A8A] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#C9A227] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              <Upload size={16} />
              {uploading ? `Upload… ${progress}%` : `Envoyer ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-[#1E3A8A] text-xl font-bold mb-5">Photos en ligne</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <p className="text-[#4A5580] text-center py-8">Aucune photo en ligne pour le moment.</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([eventName, eventPhotos]) => (
                <div key={eventName}>
                  <h3 className="text-[#1E3A8A] font-semibold text-sm uppercase tracking-wider mb-3 pb-2 border-b border-[#F8F7F2]">
                    {eventName} ({eventPhotos.length} photo{eventPhotos.length > 1 ? 's' : ''})
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {eventPhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square group">
                        <img
                          src={photo.url}
                          alt={eventName}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                        <button
                          onClick={() => handleDelete(photo)}
                          className="absolute inset-0 bg-red-500/70 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={20} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
