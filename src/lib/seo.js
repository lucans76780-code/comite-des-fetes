export const SITE_URL = 'https://www.animargueil.fr'
export const SITE_NAME = 'Anim Argueil'
export const DEFAULT_DESCRIPTION =
  "Anim Argueil – Comité des fêtes d'Argueil. Animations, événements et festivités locales à Argueil, Seine-Maritime (76)."
export const DEFAULT_OG_IMAGE = '/logo-anim-argueil.png'
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61590007125273'

export const ROUTE_SEO = {
  '/': {
    title: 'Anim Argueil – Comité des fêtes à Argueil',
    description:
      "Découvrez Anim Argueil, le comité des fêtes d'Argueil. Animations, événements et vie locale à Argueil en Seine-Maritime.",
  },
  '/evenements': {
    title: 'Événements – Anim Argueil',
    description:
      "Consultez les prochains événements et rendez-vous festifs organisés par Anim Argueil à Argueil, Seine-Maritime.",
  },
  '/galerie': {
    title: 'Galerie photo – Anim Argueil',
    description:
      "Revivez les meilleurs moments des fêtes et animations du comité des fêtes d'Argueil en photos.",
  },
  '/contact': {
    title: 'Nous contacter – Anim Argueil',
    description:
      "Contactez Anim Argueil pour vos questions, partenariats ou demandes d'information. Argueil, Seine-Maritime.",
  },
  '/suggestions': {
    title: 'Vos suggestions – Anim Argueil',
    description:
      "Proposez vos idées d'animations et d'événements pour Argueil. Le comité des fêtes vous écoute.",
  },
}

export const ADMIN_SEO = {
  title: 'Administration – Anim Argueil',
  description: 'Espace administrateur Anim Argueil.',
  noindex: true,
}

export function getSeoForPath(pathname) {
  if (pathname.startsWith('/admin')) return ADMIN_SEO
  return ROUTE_SEO[pathname] ?? {
    title: `${SITE_NAME} – Comité des fêtes à Argueil`,
    description: DEFAULT_DESCRIPTION,
  }
}
