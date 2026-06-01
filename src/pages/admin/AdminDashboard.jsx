import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Users, Images, CalendarDays, MessageSquare, LogOut, Handshake } from 'lucide-react'

const sections = [
  {
    to: '/admin/utilisateurs',
    icon: Users,
    label: 'Utilisateurs',
    description: 'Gérer les comptes administrateurs',
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-700',
  },
  {
    to: '/admin/galerie',
    icon: Images,
    label: 'Galerie',
    description: 'Ajouter et gérer les photos',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-700',
  },
  {
    to: '/admin/evenements',
    icon: CalendarDays,
    label: 'Événements',
    description: 'Publier et gérer les événements',
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-700',
  },
  {
    to: '/admin/messages',
    icon: MessageSquare,
    label: 'Messages',
    description: 'Consulter les suggestions et contacts',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-700',
  },
  {
    to: '/admin/partenaires',
    icon: Handshake,
    label: 'Partenaires',
    description: 'Gérer les partenaires du comité',
    color: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-700',
  },
]

export default function AdminDashboard() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const displayName = admin?.user_metadata?.pseudo ?? admin?.email ?? 'Admin'

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

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2
          className="text-[#1E3A8A] text-4xl tracking-wide mb-2"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Tableau de bord
        </h2>
        <p className="text-[#4A5580] mb-10">
          Bonjour <strong>{displayName}</strong>, que souhaitez-vous faire aujourd'hui ?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sections.map(({ to, icon: Icon, label, description, color, iconColor }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-5 p-6 rounded-xl border-2 ${color} hover:shadow-md transition-all duration-200 cursor-pointer group`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-sm shrink-0 ${iconColor}`}>
                <Icon size={28} />
              </div>
              <div>
                <h3 className="text-[#1A2640] font-bold text-lg group-hover:text-[#1E3A8A] transition-colors">
                  {label}
                </h3>
                <p className="text-[#4A5580] text-sm">{description}</p>
              </div>
            </Link>
          ))}
        </div>

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
