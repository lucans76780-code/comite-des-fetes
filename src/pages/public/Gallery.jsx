import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Hero from '../../components/Hero'
import { Images } from 'lucide-react'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setPhotos(data || [])
        setLoading(false)
      })
  }, [])

  const grouped = photos.reduce((acc, photo) => {
    const key = photo.nom_evenement
    if (!acc[key]) acc[key] = []
    acc[key].push(photo)
    return acc
  }, {})

  return (
    <div>
      <Hero title="Galerie photo" subtitle="Nos plus beaux souvenirs" />

      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <Images size={64} className="text-[#D4DBF0] mx-auto mb-4" />
            <h2
              className="text-[#1E3A8A] text-3xl tracking-wide mb-3"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              La galerie arrive bientôt
            </h2>
            <p className="text-[#4A5580]">
              Les photos de nos événements seront bientôt disponibles ici.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([eventName, eventPhotos]) => (
              <div key={eventName}>
                <h2
                  className="text-[#1E3A8A] text-3xl tracking-wide mb-6 pb-2 border-b-2 border-[#C9A227]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {eventName}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {eventPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setLightbox(photo)}
                      className="aspect-square overflow-hidden rounded-lg cursor-pointer group shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                      <img
                        src={photo.url}
                        alt={`Photo ${eventName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors cursor-pointer"
            onClick={() => setLightbox(null)}
            aria-label="Fermer"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.nom_evenement}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-75">
            {lightbox.nom_evenement}
          </p>
        </div>
      )}
    </div>
  )
}
