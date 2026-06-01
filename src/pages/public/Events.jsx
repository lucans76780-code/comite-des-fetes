import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Hero from '../../components/Hero'
import EventCard from '../../components/EventCard'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setEvents(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <Hero title="Événements" subtitle="Tous nos prochains rendez-vous" />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2
          className="text-[#1E3A8A] text-4xl mb-8 tracking-wide text-center"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Prochains événements
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#4A5580] text-lg">Aucun événement à venir pour le moment.</p>
            <p className="text-[#4A5580] mt-2">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
