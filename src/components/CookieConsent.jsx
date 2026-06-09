import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ANALYTICS_CONSENT_KEY,
  getAnalyticsConsent,
  hasAnalyticsConfigured,
  loadGoogleAnalytics,
  setAnalyticsConsent,
  trackPageView,
} from '../lib/analytics'

export default function CookieConsent() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const isPublic = !location.pathname.startsWith('/admin')

  useEffect(() => {
    if (!hasAnalyticsConfigured() || !isPublic) {
      setVisible(false)
      return
    }
    setVisible(!getAnalyticsConsent() && localStorage.getItem(ANALYTICS_CONSENT_KEY) !== 'denied')
  }, [location.pathname, isPublic])

  const accept = () => {
    setAnalyticsConsent(true)
    loadGoogleAnalytics()
    trackPageView(location.pathname + location.search)
    setVisible(false)
  }

  const refuse = () => {
    setAnalyticsConsent(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Choix cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div className="max-w-3xl mx-auto bg-white border-2 border-[#1E3A8A]/20 rounded-xl shadow-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-[#1A2640] text-sm leading-relaxed flex-1">
          Ce site utilise Google Analytics pour mesurer la fréquentation (pages visitées, source
          de trafic). Les données sont traitées par Google. Vous pouvez accepter ou refuser ce
          suivi.{' '}
          <Link to="/confidentialite" className="text-[#1E3A8A] underline hover:text-[#2B52C8]">
            Politique de confidentialité
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={refuse}
            className="px-4 py-2 rounded-lg border border-[#4A5580]/30 text-[#4A5580] text-sm hover:bg-[#F8F7F2] transition-colors cursor-pointer"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={accept}
            className="px-4 py-2 rounded-lg bg-[#1E3A8A] text-white text-sm hover:bg-[#2B52C8] transition-colors cursor-pointer"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
