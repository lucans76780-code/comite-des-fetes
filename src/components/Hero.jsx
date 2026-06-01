import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../lib/constants'

const CONFETTI = [
  { left: '8%',  top: '12%', color: '#E63946', size: 10, delay: '0s',    dur: '3.2s', shape: 'circle' },
  { left: '15%', top: '30%', color: '#F4A261', size: 8,  delay: '0.4s',  dur: '2.8s', shape: 'rect' },
  { left: '22%', top: '55%', color: '#2A9D8F', size: 12, delay: '0.9s',  dur: '3.5s', shape: 'circle' },
  { left: '5%',  top: '70%', color: '#E9C46A', size: 7,  delay: '1.2s',  dur: '2.6s', shape: 'rect' },
  { left: '30%', top: '10%', color: '#6A0DAD', size: 9,  delay: '0.2s',  dur: '3.1s', shape: 'star' },
  { left: '45%', top: '8%',  color: '#E63946', size: 6,  delay: '0.7s',  dur: '2.9s', shape: 'rect' },
  { left: '60%', top: '15%', color: '#F4A261', size: 11, delay: '1.5s',  dur: '3.4s', shape: 'circle' },
  { left: '75%', top: '8%',  color: '#2A9D8F', size: 8,  delay: '0.3s',  dur: '2.7s', shape: 'rect' },
  { left: '85%', top: '25%', color: '#E9C46A', size: 13, delay: '1.0s',  dur: '3.6s', shape: 'star' },
  { left: '92%', top: '50%', color: '#E63946', size: 7,  delay: '0.6s',  dur: '3.0s', shape: 'circle' },
  { left: '88%', top: '70%', color: '#6A0DAD', size: 9,  delay: '1.8s',  dur: '2.5s', shape: 'rect' },
  { left: '50%', top: '80%', color: '#F4A261', size: 8,  delay: '0.5s',  dur: '3.3s', shape: 'circle' },
  { left: '38%', top: '65%', color: '#2A9D8F', size: 6,  delay: '1.3s',  dur: '2.8s', shape: 'star' },
  { left: '70%', top: '75%', color: '#E9C46A', size: 10, delay: '0.8s',  dur: '3.7s', shape: 'rect' },
]

const BUNTING_COLORS = ['#E63946', '#F4A261', '#E9C46A', '#2A9D8F', '#6A0DAD', '#1E3A8A', '#E63946', '#F4A261', '#2A9D8F']

function ConfettiPiece({ left, top, color, size, delay, dur, shape }) {
  const base = {
    position: 'absolute',
    left,
    top,
    width: size,
    height: shape === 'rect' ? size * 0.6 : size,
    backgroundColor: color,
    borderRadius: shape === 'circle' ? '50%' : shape === 'star' ? '2px' : '2px',
    opacity: 0.85,
    animation: `confettiBounce ${dur} ${delay} ease-in-out infinite alternate`,
    zIndex: 2,
    transform: shape === 'star' ? 'rotate(45deg)' : 'none',
    pointerEvents: 'none',
  }
  return <div style={base} />
}

export default function Hero({ title, subtitle }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(/hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '600px',
      }}
    >
      <style>{`
        @keyframes confettiBounce {
          0%   { transform: translateY(0px) rotate(0deg); opacity: 0.85; }
          100% { transform: translateY(-18px) rotate(20deg); opacity: 0.55; }
        }
        @keyframes titlePulse {
          0%, 100% { text-shadow: 0 2px 12px rgba(0,0,0,0.7), 0 0 30px rgba(201,162,39,0.4); }
          50%       { text-shadow: 0 2px 20px rgba(0,0,0,0.8), 0 0 50px rgba(201,162,39,0.7); }
        }
        @keyframes subtitleFade {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.75; }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div className="absolute inset-0 bg-black/30" />

      {/* Confettis animés */}
      {CONFETTI.map((c, i) => <ConfettiPiece key={i} {...c} />)}

      {/* Guirlande triangulaire en haut */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-center pointer-events-none" style={{ height: 48 }}>
        <svg width="100%" height="48" viewBox="0 0 800 48" preserveAspectRatio="none">
          <path d="M0,4 Q400,4 800,4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" strokeDasharray="6,4" />
          {BUNTING_COLORS.map((color, i) => {
            const x = (i + 0.5) * (800 / BUNTING_COLORS.length)
            return (
              <polygon
                key={i}
                points={`${x - 12},6 ${x + 12},6 ${x},34`}
                fill={color}
                opacity="0.9"
              />
            )
          })}
        </svg>
      </div>

      {/* Étoiles décoratives */}
      <div className="absolute top-14 left-8 z-10 text-yellow-300 text-2xl pointer-events-none" style={{ animation: 'subtitleFade 2s 0.3s ease-in-out infinite', filter: 'drop-shadow(0 0 6px #E9C46A)' }}>★</div>
      <div className="absolute top-10 right-16 z-10 text-red-400 text-xl pointer-events-none" style={{ animation: 'subtitleFade 2.5s 0.8s ease-in-out infinite', filter: 'drop-shadow(0 0 6px #E63946)' }}>★</div>
      <div className="absolute top-20 right-32 z-10 text-purple-400 text-lg pointer-events-none" style={{ animation: 'subtitleFade 1.8s 1.2s ease-in-out infinite', filter: 'drop-shadow(0 0 5px #6A0DAD)' }}>✦</div>
      <div className="absolute top-16 left-24 z-10 text-green-400 text-lg pointer-events-none" style={{ animation: 'subtitleFade 2.2s 0.5s ease-in-out infinite', filter: 'drop-shadow(0 0 5px #2A9D8F)' }}>✦</div>

      <img
        src="/blason.png"
        alt="Blason d'Argueil"
        className="absolute bottom-3 left-4 z-10 h-16 md:h-20 drop-shadow-lg opacity-90"
      />

      <img
        src="/logo-anim-argueil.png"
        alt="Logo Anim Argueil – Comité des Fêtes"
        className="absolute bottom-3 right-4 z-10 h-20 md:h-28 drop-shadow-xl"
      />

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-4 right-4 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors duration-200 cursor-pointer text-white border border-white/30"
        aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute top-16 right-4 z-30 bg-white rounded-xl shadow-2xl overflow-hidden min-w-52 border border-[#D4DBF0]">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-5 py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer border-b border-[#F0F2FA] last:border-0
                    ${active
                      ? 'bg-[#1E3A8A] text-white'
                      : 'text-[#1A2640] hover:bg-[#F0F4FF] hover:text-[#1E3A8A]'
                    }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </>
      )}

      <div className="relative z-10 text-center px-4">
        <h1
          className="text-5xl md:text-7xl tracking-widest drop-shadow-lg"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#C9A227',
            animation: 'titlePulse 3s ease-in-out infinite',
          }}
        >
          {title || "Comité des Fêtes d'Argueil"}
        </h1>
        <p
          className="mt-3 text-white text-base md:text-lg font-semibold tracking-widest uppercase drop-shadow"
          style={{ animation: 'subtitleFade 2.5s ease-in-out infinite', letterSpacing: '0.25em' }}
        >
          🎉 Animation &amp; convivialité à Argueil 🎉
        </p>
        {subtitle && (
          <p className="mt-2 text-[#E8C03A] text-lg md:text-xl font-semibold tracking-wide drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
