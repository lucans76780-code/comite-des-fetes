import { Link } from 'react-router-dom'
import { NAV_LINKS } from '../lib/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1E3A8A] text-[#BCC8E8] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Identité */}
          <div className="flex items-start gap-4">
            <img src="/blason.png" alt="Blason d'Argueil" className="h-14 shrink-0 opacity-90" />
            <div>
              <h3
                className="text-white text-2xl tracking-wide mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Comité des Fêtes d'Argueil
              </h3>
              <p className="text-sm leading-relaxed">
                Organisation des festivités locales et animation de la vie de village à Argueil.
              </p>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-[#C9A227] font-semibold uppercase tracking-wider text-sm mb-3">
              Liens rapides
            </h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#C9A227] font-semibold uppercase tracking-wider text-sm mb-3">
              Contact
            </h4>
            <p className="text-sm leading-relaxed">
              Vous avez une question ou une suggestion&nbsp;?<br />
              <Link
                to="/contact"
                className="underline hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Contactez-nous
              </Link>
            </p>
          </div>
        </div>

        <div className="border-t border-[#2B52C8] pt-4 text-center text-sm space-y-2">
          <p>© {year} Comité des Fêtes d'Argueil. Tous droits réservés.</p>
          <p>
            <Link
              to="/confidentialite"
              className="underline hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
