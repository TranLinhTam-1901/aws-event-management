import React, { useEffect, useState } from 'react';
import { EventCard } from './EventCard';
import eventService from '../../services/eventService';
import type { Event } from '../../services/eventService';

interface Props {
  variant?: 'public' | 'admin';
}

export const EventList: React.FC<Props> = ({ variant = 'public' }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);

    try {
      const data =
        variant === 'admin'
          ? await eventService.getAdminEvents()
          : await eventService.getPublicEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [variant]);

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (!events.length) {
    return (
      <div>
        {variant === 'admin'
          ? 'No events yet.'
          : 'No events available.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.eventId}
          event={event}
          variant={variant}
          onActionComplete={loadEvents}
        />
      ))}
    </div>
  );
};
