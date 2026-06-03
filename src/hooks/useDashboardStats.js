import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const todayIso = () => new Date().toISOString().slice(0, 10)

export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    const today = todayIso()

    try {
      const [
        unreadContacts,
        unreadSuggestions,
        contactsTotal,
        suggestionsTotal,
        eventRequestsTotal,
        eventsUpcoming,
        eventsTotal,
        galleryTotal,
        partnersTotal,
        recentContacts,
        recentSuggestions,
        recentRequests,
      ] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('lu', false),
        supabase.from('suggestions').select('id', { count: 'exact', head: true }).eq('lu', false),
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('suggestions').select('id', { count: 'exact', head: true }),
        supabase.from('event_requests').select('id', { count: 'exact', head: true }),
        supabase
          .from('events')
          .select('id, titre, date, lieu')
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(3),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('gallery_photos').select('id', { count: 'exact', head: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }),
        supabase
          .from('contacts')
          .select('id, prenom, nom, sujet, created_at, lu')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('suggestions')
          .select('id, prenom, nom, suggestion, created_at, lu')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('event_requests')
          .select('id, prenom, nom, nom_evenement, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
      ])

      const errs = [
        unreadContacts.error,
        unreadSuggestions.error,
        eventsUpcoming.error,
      ].filter(Boolean)
      if (errs.length) throw errs[0]

      const unreadMessages =
        (unreadContacts.count ?? 0) +
        (unreadSuggestions.count ?? 0) +
        (eventRequestsTotal.count ?? 0)

      const recentActivity = [
        ...(recentContacts.data ?? []).map((r) => ({
          id: `contact-${r.id}`,
          type: 'contact',
          label: `${r.prenom} ${r.nom}`,
          detail: r.sujet || 'Message contact',
          date: r.created_at,
          unread: !r.lu,
        })),
        ...(recentSuggestions.data ?? []).map((r) => ({
          id: `suggestion-${r.id}`,
          type: 'suggestion',
          label: `${r.prenom} ${r.nom}`,
          detail: (r.suggestion || '').slice(0, 60) || 'Suggestion',
          date: r.created_at,
          unread: !r.lu,
        })),
        ...(recentRequests.data ?? []).map((r) => ({
          id: `request-${r.id}`,
          type: 'request',
          label: `${r.prenom} ${r.nom}`,
          detail: r.nom_evenement || 'Demande d\'événement',
          date: r.created_at,
          unread: true,
        })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

      setStats({
        unreadMessages,
        messagesTotal:
          (contactsTotal.count ?? 0) +
          (suggestionsTotal.count ?? 0) +
          (eventRequestsTotal.count ?? 0),
        upcomingEvents: eventsUpcoming.data ?? [],
        eventsTotal: eventsTotal.count ?? 0,
        galleryTotal: galleryTotal.count ?? 0,
        partnersTotal: partnersTotal.count ?? 0,
        recentActivity,
      })
    } catch (e) {
      setError(e?.message ?? 'Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refresh: fetchStats }
}
