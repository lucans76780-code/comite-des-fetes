import { SITE_URL, FACEBOOK_URL } from '../lib/seo'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Anim Argueil',
  alternateName: "Comité des fêtes d'Argueil",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-anim-argueil.png`,
  description:
    "Association locale d'animation et de festivités à Argueil, Seine-Maritime.",
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Argueil',
    addressRegion: 'Seine-Maritime',
    addressCountry: 'FR',
  },
  sameAs: [FACEBOOK_URL],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  )
}
