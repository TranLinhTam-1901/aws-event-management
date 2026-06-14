import { useEffect, useState } from "react";
import eventService from "../../services/eventService";

interface EventItem {
  eventId: string;
  title: string;
  location: string;
}

export default function EventTestPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventService.getPublicEvents();
        setEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Lambda Local Test</h1>

      {events.map((event) => (
        <div key={event.eventId}>
          <h3>{event.title}</h3>
          <p>{event.location}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}