import React from 'react';
import { AppCard } from '../common/AppCard';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';
import type { Event } from '../../services/eventService';
import {
  canAdminToggleVisibility,
  canRegisterForEvent,
  getEventBannerSrc,
  getEventStatusBadgeClass,
  getEventStatusLabel,
  normalizeEventStatus,
} from '../../utils/eventStatusUtils';

interface Props {
  event: Event;
  variant?: 'public' | 'admin';
  onActionComplete?: () => void;
}

export const EventCard: React.FC<Props> = ({
  event,
  variant = 'public',
  onActionComplete,
}) => {
  const navigate = useNavigate();
  const normalizedStatus = normalizeEventStatus(event.status);
  const isAdmin = variant === 'admin';
  const canToggleVisibility = canAdminToggleVisibility(event.status);
  const bannerSrc = getEventBannerSrc(event);

  const handleEdit = () => {
    navigate(`/admin/events/${event.eventId}/edit`);
  };

  const handleToggleVisibility = async () => {
    if (!canToggleVisibility) {
      return;
    }

    const nextVisible = !event.isVisible;
    const actionLabel = nextVisible ? 'show' : 'hide';
    const confirmed = window.confirm(
      `${nextVisible ? 'Show' : 'Hide'} event "${event.title}" on the public page?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await eventService.setEventVisibility(event.eventId, nextVisible);
      onActionComplete?.();
    } catch (error) {
      console.error(error);
      alert(`Failed to ${actionLabel} event`);
    }
  };

  return (
    <AppCard>
      {bannerSrc ? (
        <img
          src={bannerSrc}
          alt={event.title}
          className="w-full h-40 object-cover rounded mb-4"
        />
      ) : (
        <div className="bg-gray-200 h-40 rounded mb-4 flex items-center justify-center text-gray-400 text-sm">
          No banner image
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${getEventStatusBadgeClass(event.status)}`}
        >
          {getEventStatusLabel(event.status)}
        </span>

        {isAdmin && !event.isVisible && normalizedStatus === 'Active' && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700">
            Hidden
          </span>
        )}

        {isAdmin && normalizedStatus === 'Ended' && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700">
            Auto-hidden from public
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold mb-1">{event.title}</h3>
      <p className="text-gray-600 text-sm mb-1">{event.location}</p>
      <p className="text-gray-500 text-xs mb-2">
        {new Date(event.startTime).toLocaleString()} — {new Date(event.endTime).toLocaleString()}
      </p>

      {!isAdmin && (
        <p className="text-sm text-gray-600 mb-3">
          {canRegisterForEvent(event.status, event.isFull)
            ? `${event.availableSlots} slots available`
            : normalizedStatus === 'Ended'
              ? 'Event has ended'
              : normalizedStatus === 'Cancelled'
                ? 'Event was cancelled'
                : event.isFull
                  ? 'Đã hết slot đăng ký'
                  : 'Registration unavailable'}
        </p>
      )}

      {isAdmin && (
        <p className="text-sm text-gray-600 mb-3">
          {event.registeredCount}/{event.maxSlots} registered
        </p>
      )}

      {isAdmin ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleEdit}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>

          {canToggleVisibility && (
            <button
              onClick={handleToggleVisibility}
              className={`w-full py-2 text-white rounded ${
                event.isVisible
                  ? 'bg-slate-600 hover:bg-slate-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {event.isVisible ? 'Hide Event' : 'Show Event'}
            </button>
          )}
        </div>
      ) : (
        normalizedStatus === 'Active' && (
          <button
            onClick={() => navigate(`/events/${event.eventId}`)}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Details
          </button>
        )
      )}
    </AppCard>
  );
};
