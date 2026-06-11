export const SITE_URL = 'https://www.animargueil.fr'

/** Google Search Console — propriété domaine animargueil.fr */
export const SEARCH_CONSOLE_URL =
  import.meta.env.VITE_SEARCH_CONSOLE_URL?.trim() ||
  'https://search.google.com/search-console?resource_id=sc-domain%3Aanimargueil.fr'

/** Fiche Google Business / résultat « Anim Argueil » sur Google */
export const GOOGLE_BUSINESS_URL =
  import.meta.env.VITE_GOOGLE_BUSINESS_URL?.trim() ||
  'https://www.google.com/search?q=animargueil&stick=H4sIAAAAAAAA_-NgU1I2qLAwSjQ0NjAxMDQzSzQ1T7EyqDA0MDMyMjYwSjJKTDM0N1zEyp2Yl5mbWJRempqZAwATsT7qNQAAAA&hl=fr&mat=CXU8XTq_H4LQElcBTVDHngfhQqY0cAsAz0_u_NL4PNyrQYQ2uqGwE5gAp-IuBG3BaH24ZowdAeOx9az1vM31vzAubkd0tGyVX_1kRQakviIyHudB74RDIzSDqAPH5KO1p5k'

/** Tableau de bord pour modifier la fiche (horaires, avis, photos) */
export const GOOGLE_BUSINESS_MANAGE_URL = 'https://business.google.com/'
export const SITE_NAME = 'Anim Argueil'
export const DEFAULT_DESCRIPTION =
  "Anim Argueil – Comité des fêtes d'Argueil. Animations, événements et festivités locales à Argueil, Seine-Maritime (76)."
export const DEFAULT_OG_IMAGE = '/logo-anim-argueil.png'
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61590480911849'

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
  '/confidentialite': {
    title: 'Politique de confidentialité – Anim Argueil',
    description:
      "Comment le Comité des fêtes d'Argueil collecte, utilise et protège vos données personnelles (RGPD).",
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
