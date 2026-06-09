import { SITE_URL } from '../lib/seo'

export default function EventsJsonLd({ events }) {
  if (!events?.length) return null

  const graph = events.map((event) => ({
    '@type': 'Event',
    name: event.nom,
    ...(event.resume?.trim() && { description: event.resume.trim() }),
    startDate: event.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.lieu,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Argueil',
        addressRegion: 'Seine-Maritime',
        addressCountry: 'FR',
      },
    },
    ...(event.affiche_url && { image: event.affiche_url }),
    organizer: {
      '@type': 'Organization',
      name: 'Anim Argueil',
      alternateName: "Comité des fêtes d'Argueil",
      url: SITE_URL,
    },
    url: `${SITE_URL}/evenements`,
  }))

  const schema = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
