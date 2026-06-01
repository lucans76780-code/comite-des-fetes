import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Trash2, Mail, Lightbulb, Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

function MessageCard({ item, onDelete, type }) {
  const [expanded, setExpanded] = useState(false)

  const mainText = type === 'contact' ? item.message : (item.suggestion || item.description)
  const isLong = mainText?.length > 120

  return (
    <div className={`bg-white border-l-4 ${type === 'contact' ? 'border-purple-400' : 'border-amber-400'} rounded-xl shadow-sm p-5 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-[#1A2640] text-sm">
              {item.prenom} {item.nom}
            </span>
            {!item.lu && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${type === 'contact' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                Nouveau
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-[#4A5580]">
            <span className="flex items-center gap-1"><Mail size={11} />{item.email}</span>
            {item.telephone && <span className="flex items-center gap-1"><Phone size={11} />{item.telephone}</span>}
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          {type === 'contact' && item.sujet && (
            <p className="mt-2 text-sm font-semibold text-[#1E3A8A]">Sujet : {item.sujet}</p>
          )}
          {type === 'request' && item.nom_evenement && (
            <p className="mt-2 text-sm font-semibold text-[#1E3A8A]">Événement souhaité : {item.nom_evenement}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Texte principal */}
      <div className="bg-[#F8F7F2] rounded-lg px-4 py-3 text-sm text-[#1A2640] leading-relaxed">
        <p className={!expanded && isLong ? 'line-clamp-3' : ''}>
          {mainText}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[#C9A227] text-xs mt-2 cursor-pointer hover:underline"
          >
            {expanded ? <><ChevronUp size={12} /> Voir moins</> : <><ChevronDown size={12} /> Voir plus</>}
          </button>
        )}
      </div>

      {/* Infos supplémentaires pour demande d'événement */}
      {type === 'request' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4A5580]">
          {item.date_souhaitee && (
            <span>📅 Date souhaitée : {new Date(item.date_souhaitee).toLocaleDateString('fr-FR')}</span>
          )}
          {item.lieu_souhaite && (
            <span>📍 Lieu souhaité : {item.lieu_souhaite}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminMessages() {
  const [contacts, setContacts] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [eventRequests, setEventRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('demandes')

  const fetchAll = useCallback(async () => {
    const [contactsRes, suggestionsRes, requestsRes] = await Promise.all([
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
      supabase.from('event_requests').select('*').order('created_at', { ascending: false }),
    ])
    setContacts(contactsRes.data || [])
    setSuggestions(suggestionsRes.data || [])
    setEventRequests(requestsRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const deleteContact = async (id) => {
    if (!window.confirm('Supprimer ce message ?')) return
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (!error) fetchAll()
  }

  const deleteSuggestion = async (id) => {
    if (!window.confirm('Supprimer cette suggestion ?')) return
    const { error } = await supabase.from('suggestions').delete().eq('id', id)
    if (!error) fetchAll()
  }

  const deleteRequest = async (id) => {
    if (!window.confirm('Supprimer cette demande ?')) return
    const { error } = await supabase.from('event_requests').delete().eq('id', id)
    if (!error) fetchAll()
  }

  const tabs = [
    {
      id: 'demandes',
      label: 'Demandes & Suggestions',
      icon: Lightbulb,
      count: eventRequests.length + suggestions.length,
      color: 'text-amber-700 border-amber-400 bg-amber-50',
      activeColor: 'bg-amber-400 text-white border-amber-400',
    },
    {
      id: 'contacts',
      label: 'Messages de contact',
      icon: Mail,
      count: contacts.length,
      color: 'text-purple-700 border-purple-400 bg-purple-50',
      activeColor: 'bg-purple-400 text-white border-purple-400',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <header className="bg-[#1E3A8A] text-white px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/admin" className="text-[#D4DBF0] hover:text-white transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Messages
            </h1>
            <p className="text-[#D4DBF0] text-sm">Suggestions, demandes et contacts</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Onglets */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 cursor-pointer ${isActive ? tab.activeColor : tab.color}`}
              >
                <Icon size={16} />
                {tab.label}
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-white'}`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Section Demandes & Suggestions */}
            {activeTab === 'demandes' && (
              <div className="space-y-6">
                {/* Demandes d'événement */}
                {eventRequests.length > 0 && (
                  <div>
                    <h3 className="text-[#1E3A8A] font-bold text-base uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar size={16} />
                      Demandes de création d'événement ({eventRequests.length})
                    </h3>
                    <div className="space-y-3">
                      {eventRequests.map((item) => (
                        <MessageCard key={item.id} item={item} onDelete={deleteRequest} type="request" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div>
                    <h3 className="text-[#1E3A8A] font-bold text-base uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Lightbulb size={16} />
                      Suggestions d'idées ({suggestions.length})
                    </h3>
                    <div className="space-y-3">
                      {suggestions.map((item) => (
                        <MessageCard key={item.id} item={item} onDelete={deleteSuggestion} type="suggestion" />
                      ))}
                    </div>
                  </div>
                )}

                {eventRequests.length === 0 && suggestions.length === 0 && (
                  <div className="text-center py-16 text-[#4A5580]">
                    <Lightbulb size={48} className="mx-auto mb-4 text-[#D4DBF0]" />
                    <p>Aucune demande ni suggestion pour le moment.</p>
                  </div>
                )}
              </div>
            )}

            {/* Section Contacts */}
            {activeTab === 'contacts' && (
              <div className="space-y-3">
                {contacts.length === 0 ? (
                  <div className="text-center py-16 text-[#4A5580]">
                    <Mail size={48} className="mx-auto mb-4 text-[#D4DBF0]" />
                    <p>Aucun message de contact pour le moment.</p>
                  </div>
                ) : (
                  contacts.map((item) => (
                    <MessageCard key={item.id} item={item} onDelete={deleteContact} type="contact" />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

