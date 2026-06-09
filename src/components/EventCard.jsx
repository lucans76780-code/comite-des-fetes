import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { googleMapsUrl } from '../lib/maps'

export default function EventCard({ event }) {
  const { nom, date, lieu, affiche_url, resume } = event

  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col border border-[#D4DBF0]">
      <div className="relative aspect-[3/4] max-h-[22rem] bg-[#F0F4FF] overflow-hidden flex items-center justify-center">
        {affiche_url ? (
          <img
            src={affiche_url}
            alt={`Affiche de ${nom}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center min-h-48">
            <img src="/blason.png" alt="" className="h-16 opacity-20" />
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3
          className="text-[#1E3A8A] text-2xl mb-3 tracking-wide"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {nom}
        </h3>

        {resume?.trim() && (
          <p className="text-sm text-[#1A2640] leading-relaxed mb-3 flex-1">{resume.trim()}</p>
        )}

        <div className="flex flex-col gap-2 text-sm text-[#4A5580] mt-auto">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#C9A227] shrink-0" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-[#C9A227] shrink-0 mt-0.5" />
            <a
              href={googleMapsUrl(lieu)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#1E3A8A] underline transition-colors cursor-pointer"
            >
              {lieu}
              <ExternalLink size={12} className="shrink-0 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
