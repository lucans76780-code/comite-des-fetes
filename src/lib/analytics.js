export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || ''

/** Lien vers le tableau de bord GA4 (à personnaliser dans .env si besoin). */
export const GA_DASHBOARD_URL =
  import.meta.env.VITE_GA_DASHBOARD_URL?.trim() || 'https://analytics.google.com/'

export const ANALYTICS_CONSENT_KEY = 'animargueil_analytics_consent'

export function hasAnalyticsConfigured() {
  return Boolean(GA_MEASUREMENT_ID)
}

export function getAnalyticsConsent() {
  try {
    return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'granted'
  } catch {
    return false
  }
}

export function setAnalyticsConsent(granted) {
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, granted ? 'granted' : 'denied')
  } catch {
    /* ignore */
  }
}

export function loadGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || window.__gaLoaded) return
  window.__gaLoaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
}

export function trackPageView(path) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: path })
}
