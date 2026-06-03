import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import {
  GA_DASHBOARD_URL,
  hasAnalyticsConfigured,
} from '../../lib/analytics'
import {
  GOOGLE_BUSINESS_MANAGE_URL,
  GOOGLE_BUSINESS_URL,
  SEARCH_CONSOLE_URL,
} from '../../lib/seo'
import {
  Users,
  Images,
  CalendarDays,
  MessageSquare,
  LogOut,
  Handshake,
  BarChart3,
  Search,
  Store,
  ExternalLink,
  RefreshCw,
  Mail,
  Lightbulb,
  Calendar,
  AlertCircle,
} from 'lucide-react'

const sections = [
  {
    to: '/admin/utilisateurs',
    icon: Users,
    label: 'Utilisateurs',
    description: 'Gérer les comptes administrateurs',
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-700',
    badgeKey: null,
  },
  {
    to: '/admin/galerie',
    icon: Images,
    label: 'Galerie',
    description: 'Ajouter et gérer les photos',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-700',
    badgeKey: 'galleryTotal',
  },
  {
    to: '/admin/evenements',
    icon: CalendarDays,
    label: 'Événements',
    description: 'Publier et gérer les événements',
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-700',
    badgeKey: 'eventsTotal',
  },
  {
    to: '/admin/messages',
    icon: MessageSquare,
    label: 'Messages',
    description: 'Consulter les suggestions et contacts',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-700',
    badgeKey: 'unreadMessages',
    badgeAlert: true,
  },
  {
    to: '/admin/partenaires',
    icon: Handshake,
    label: 'Partenaires',
    description: 'Gérer les partenaires du comité',
    color: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-700',
    badgeKey: 'partnersTotal',
  },
]

function StatCard({ label, value, sub, accent = 'text-[#1E3A8A]' }) {
  return (
    <div className="bg-white rounded-xl border border-[#1E3A8A]/15 shadow-sm p-5">
      <p className="text-[#4A5580] text-xs uppercase tracking-wider font-semibold mb-1">
        {label}
      </p>
      <p className={`text-3xl font-bold ${accent}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        {value}
      </p>
      {sub && <p className="text-[#4A5580] text-sm mt-1">{sub}</p>}
    </div>
  )
}

function activityIcon(type) {
  if (type === 'contact') return Mail
  if (type === 'suggestion') return Lightbulb
  return CalendarDays
}

export default function AdminDashboard() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const { stats, loading, error, refresh } = useDashboardStats()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const displayName = admin?.user_metadata?.pseudo ?? admin?.email ?? 'Admin'
  const gaConfigured = hasAnalyticsConfigured()
  const nextEvent = stats?.upcomingEvents?.[0]

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <header className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div>
          <h1
            className="text-3xl tracking-widest"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Administration
          </h1>
          <p className="text-[#BCC8E8] text-sm">Comité des Fêtes d'Argueil</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-[#BCC8E8] text-xs">Administrateur</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors duration-200 px-3 py-2 rounded-lg cursor-pointer text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-[#1E3A8A] text-4xl tracking-wide mb-2"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Tableau de bord
            </h2>
            <p className="text-[#4A5580]">
              Bonjour <strong>{displayName}</strong> — vue d'ensemble du site et de l'activité.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-[#1E3A8A] border border-[#1E3A8A]/30 bg-white px-3 py-2 rounded-lg hover:bg-[#EEF2FF] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Statistiques site (Supabase) */}
        <section className="mb-10">
          <h3 className="text-[#1A2640] font-bold text-lg mb-4">Activité du site</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Messages non lus"
              value={loading ? '…' : (stats?.unreadMessages ?? 0)}
              sub={stats?.messagesTotal != null ? `${stats.messagesTotal} au total` : undefined}
              accent={stats?.unreadMessages > 0 ? 'text-purple-700' : 'text-[#1E3A8A]'}
            />
            <StatCard
              label="Événements à venir"
              value={loading ? '…' : (stats?.upcomingEvents?.length ?? 0)}
              sub={
                nextEvent
                  ? `Prochain : ${nextEvent.nom} (${new Date(nextEvent.date).toLocaleDateString('fr-FR')})`
                  : 'Aucun événement planifié'
              }
            />
            <StatCard
              label="Photos galerie"
              value={loading ? '…' : (stats?.galleryTotal ?? 0)}
            />
            <StatCard
              label="Partenaires"
              value={loading ? '…' : (stats?.partnersTotal ?? 0)}
            />
          </div>
        </section>

        {/* Google Analytics */}
        <section className="mb-10">
          <h3 className="text-[#1A2640] font-bold text-lg mb-4">Fréquentation & référencement</h3>
          <div className="bg-white rounded-xl border-2 border-[#1E3A8A]/20 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#1E3A8A] shrink-0">
                <BarChart3 size={28} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#1A2640] text-lg mb-1">Google Analytics 4</h4>
                {gaConfigured ? (
                  <p className="text-[#4A5580] text-sm leading-relaxed">
                    Consultez les pages les plus visitées, l'origine du trafic (Google, Facebook,
                    accès direct), les appareils et l'évolution des visites sur{' '}
                    <strong>www.animargueil.fr</strong>.
                  </p>
                ) : (
                  <p className="text-[#4A5580] text-sm leading-relaxed">
                    Ajoutez votre identifiant de mesure GA4 (<code className="text-xs bg-[#F8F7F2] px-1 rounded">VITE_GA_MEASUREMENT_ID</code>{' '}
                    dans le fichier <code className="text-xs bg-[#F8F7F2] px-1 rounded">.env</code> sur Vercel) pour activer le suivi et ce lien.
                  </p>
                )}
              </div>
              {gaConfigured && (
                <a
                  href={GA_DASHBOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white px-5 py-3 rounded-lg hover:bg-[#2B52C8] transition-colors text-sm font-semibold shrink-0 cursor-pointer"
                >
                  Ouvrir Google Analytics
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            {gaConfigured && (
              <p className="mt-4 text-xs text-[#4A5580] border-t border-[#1E3A8A]/10 pt-4">
                Astuce : dans GA4, consultez <em>Rapports → Engagement → Pages et écrans</em> pour
                voir où vont les visiteurs (Accueil, Événements, Contact…).
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border-2 border-[#C9A227]/30 p-6 shadow-sm mt-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center text-[#C9A227] shrink-0">
                <Search size={28} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#1A2640] text-lg mb-1">Google Search Console</h4>
                <p className="text-[#4A5580] text-sm leading-relaxed">
                  Vérifiez si vos pages sont <strong>indexées</strong> par Google, l'état du
                  sitemap et les éventuels problèmes de référencement pour{' '}
                  <strong>animargueil.fr</strong>.
                </p>
              </div>
              <a
                href={SEARCH_CONSOLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#C9A227] text-[#1A2640] px-5 py-3 rounded-lg hover:bg-[#E0B83D] transition-colors text-sm font-semibold shrink-0 cursor-pointer"
              >
                Voir l'indexation
                <ExternalLink size={16} />
              </a>
            </div>
            <p className="mt-4 text-xs text-[#4A5580] border-t border-[#C9A227]/20 pt-4">
              Astuce : <em>Indexation → Pages</em> pour les URL indexées, <em>Sitemaps</em> pour
              confirmer que <code className="text-xs bg-[#F8F7F2] px-1 rounded">sitemap.xml</code>{' '}
              est bien pris en compte.
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-sm mt-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                <Store size={28} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#1A2640] text-lg mb-1">Google Business</h4>
                <p className="text-[#4A5580] text-sm leading-relaxed">
                  Consultez la fiche <strong>Anim Argueil</strong> telle qu'elle apparaît sur Google
                  (avis, horaires, photos) et modifiez-la depuis le tableau de bord Google Business.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <a
                  href={GOOGLE_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white px-5 py-3 rounded-lg hover:bg-emerald-800 transition-colors text-sm font-semibold cursor-pointer"
                >
                  Voir sur Google
                  <ExternalLink size={16} />
                </a>
                <a
                  href={GOOGLE_BUSINESS_MANAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-emerald-300 text-emerald-800 px-5 py-3 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-semibold cursor-pointer"
                >
                  Gérer la fiche
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Activité récente */}
        {!loading && stats?.recentActivity?.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1A2640] font-bold text-lg">Activité récente</h3>
              <Link
                to="/admin/messages"
                className="text-sm text-[#1E3A8A] hover:underline cursor-pointer"
              >
                Voir tout →
              </Link>
            </div>
            <ul className="bg-white rounded-xl border border-[#1E3A8A]/15 divide-y divide-[#1E3A8A]/10 shadow-sm">
              {stats.recentActivity.map((item) => {
                const Icon = activityIcon(item.type)
                return (
                  <li key={item.id}>
                    <Link
                      to="/admin/messages"
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8F7F2] transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#F8F7F2] flex items-center justify-center text-[#1E3A8A] shrink-0">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1A2640] text-sm truncate">
                          {item.label}
                          {item.unread && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </p>
                        <p className="text-[#4A5580] text-xs truncate">{item.detail}</p>
                      </div>
                      <span className="text-xs text-[#4A5580] shrink-0 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(item.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Sections admin */}
        <section>
          <h3 className="text-[#1A2640] font-bold text-lg mb-4">Gestion</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {sections.map(({ to, icon: Icon, label, description, color, iconColor, badgeKey, badgeAlert }) => {
              const badge =
                badgeKey && stats != null && stats[badgeKey] != null ? stats[badgeKey] : null
              const showBadge = badge != null && badge > 0

              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-5 p-6 rounded-xl border-2 ${color} hover:shadow-md transition-all duration-200 cursor-pointer group`}
                >
                  {showBadge && (
                    <span
                      className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full ${
                        badgeAlert
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/90 text-[#1A2640] border border-[#1E3A8A]/20'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-sm shrink-0 ${iconColor}`}
                  >
                    <Icon size={28} />
                  </div>
                  <div className="pr-8">
                    <h3 className="text-[#1A2640] font-bold text-lg group-hover:text-[#1E3A8A] transition-colors">
                      {label}
                    </h3>
                    <p className="text-[#4A5580] text-sm">{description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="text-[#4A5580] hover:text-[#1E3A8A] text-sm underline transition-colors cursor-pointer"
          >
            ← Retour au site public
          </Link>
        </div>
      </main>
    </div>
  )
}
