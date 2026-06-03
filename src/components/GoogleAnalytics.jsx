import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  GA_MEASUREMENT_ID,
  getAnalyticsConsent,
  loadGoogleAnalytics,
  trackPageView,
} from '../lib/analytics'

/** Suivi GA4 des pages publiques uniquement, après consentement cookies. */
export default function GoogleAnalytics() {
  const { pathname, search } = useLocation()
  const isPublic = !pathname.startsWith('/admin')

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !isPublic || !getAnalyticsConsent()) return
    loadGoogleAnalytics()
  }, [isPublic])

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !isPublic || !getAnalyticsConsent()) return
    trackPageView(pathname + search)
  }, [pathname, search, isPublic])

  return null
}
