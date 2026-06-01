import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Hero from '../../components/Hero'
import { supabase } from '../../lib/supabase'
import { Building2 } from 'lucide-react'

const menuCards = [
  {
    to: '/evenements',
    label: 'Événements',
    image: '/card-evenements.jpg',
    description: 'Découvrez nos prochains rendez-vous',
  },
  {
    to: '/suggestions',
    label: 'Vos suggestions',
    image: '/card-suggestions.jpg',
    description: 'Proposez vos idées d\'animation',
  },
  {
    to: '/galerie',
    label: 'Galerie photo',
    image: '/card-galerie.jpg',
    description: 'Revivez nos meilleurs moments',
  },
  {
    to: '/contact',
    label: 'Nous contacter',
    image: '/card-contact.jpg',
    description: 'Une question ? Écrivez-nous',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [partners, setPartners] = useState([])

  useEffect(() => {
    supabase.from('partners').select('*').order('created_at', { ascending: true }).then(({ data }) => {
      setPartners(data || [])
    })
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero avec bouton admin discret */}
      <div className="relative">
        <Hero title="Anim Argueil" />
        <button
          onClick={() => navigate('/admin/login')}
          className="absolute top-3 left-3 z-20 text-xs text-white/40 hover:text-white/80 transition-colors duration-200 cursor-pointer bg-transparent border-none"
          aria-label="Espace administrateur"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          Administrateur
        </button>
      </div>

      {/* Présentation */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2
          className="text-[#1E3A8A] text-4xl mb-6 tracking-wide"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Bienvenue sur notre site
        </h2>
        <p className="text-[#4A5580] text-lg leading-relaxed mb-4">
          Le <strong className="text-[#1E3A8A]">Comité des Fêtes d'Argueil</strong> vient de voir le jour !
          Porté par des bénévoles enthousiastes et attachés à leur village, notre association a pour
          vocation d'animer et de valoriser la vie locale dans notre belle commune de Seine-Maritime.
        </p>
        <p className="text-[#4A5580] text-lg leading-relaxed mb-4">
          Nous avons de nombreux projets et idées pour rassembler habitants et visiteurs autour de moments
          festifs et conviviaux. Fêtes de village, repas champêtres, animations pour petits et grands…
          l'aventure ne fait que commencer !
        </p>
        <p className="text-[#4A5580] text-lg leading-relaxed">
          Vous souhaitez participer, proposer une idée ou simplement nous soutenir ?
          N'hésitez pas à nous contacter, toutes les bonnes volontés sont les bienvenues !
        </p>
      </section>

      {/* Séparateur */}
      <div className="flex items-center px-8 max-w-4xl mx-auto w-full">
        <div className="flex-1 h-px bg-[#D4DBF0]" />
        <div className="mx-4 w-3 h-3 rounded-full bg-[#C9A227]" />
        <div className="flex-1 h-px bg-[#D4DBF0]" />
      </div>

      {/* Cartes menu */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <h2
          className="text-[#1E3A8A] text-4xl text-center mb-8 tracking-wide"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Explorer le site
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuCards.map(({ to, label, image, description }) => (
            <Link
              key={to}
              to={to}
              className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer h-56 flex items-end"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300" />
              <div className="relative z-10 p-5 w-full">
                <h3
                  className="text-white text-3xl tracking-wide drop-shadow-md"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {label}
                </h3>
                <p className="text-[#E8C03A] text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Séparateur */}
      <div className="flex items-center px-8 max-w-4xl mx-auto w-full">
        <div className="flex-1 h-px bg-[#D4DBF0]" />
        <div className="mx-4 w-3 h-3 rounded-full bg-[#C9A227]" />
        <div className="flex-1 h-px bg-[#D4DBF0]" />
      </div>

      {/* Section Nos partenaires */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <h2
          className="text-[#1E3A8A] text-4xl text-center mb-3 tracking-wide"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Nos partenaires
        </h2>
        <p className="text-[#4A5580] text-center mb-10 text-sm">
          Ils nous soutiennent dans l'organisation de nos événements
        </p>

        {partners.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#BCC8E8] text-sm">Aucun partenaire pour le moment.</p>
            <p className="text-center mt-3 text-xs text-[#BCC8E8]">
              Vous souhaitez devenir partenaire ?{' '}
              <Link to="/contact" className="underline hover:text-[#1E3A8A] transition-colors cursor-pointer">
                Contactez-nous
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {partners.map((partner) => {
                const card = (
                  <div className="bg-white border border-[#D4DBF0] rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow duration-200 h-full">
                    {partner.photo_url ? (
                      <img src={partner.photo_url} alt={partner.nom} className="h-16 w-full object-contain" loading="lazy" />
                    ) : (
                      <div className="h-16 flex items-center justify-center">
                        <Building2 size={36} className="text-[#D4DBF0]" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-semibold text-[#1A2640] text-sm">{partner.nom}</p>
                      {partner.lieu && <p className="text-[#4A5580] text-xs">{partner.lieu}</p>}
                    </div>
                  </div>
                )
                return partner.lien ? (
                  <a key={partner.id} href={partner.lien} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    {card}
                  </a>
                ) : (
                  <div key={partner.id}>{card}</div>
                )
              })}
            </div>
            <p className="text-center mt-6 text-xs text-[#BCC8E8]">
              Vous souhaitez devenir partenaire ?{' '}
              <Link to="/contact" className="underline hover:text-[#1E3A8A] transition-colors cursor-pointer">Contactez-nous</Link>
            </p>
          </>
        )}
      </section>
    </div>
  )
}
