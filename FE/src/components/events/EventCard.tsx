import React from 'react';
import { toast } from 'react-hot-toast';
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
    const actionLabel = nextVisible ? 'hiện' : 'ẩn';

    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom(
        (t) => (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 max-w-sm">
            <p className="text-sm font-medium text-gray-800 mb-3">
              {`${nextVisible ? 'Hiện' : 'Ẩn'} sự kiện "${event.title}" trên trang công khai?`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              >
                Xác nhận
              </button>
            </div>
          </div>
        ),
        { duration: Infinity, id: 'event-visibility-confirm' }
      );
    });

    if (!confirmed) {
      return;
    }

    try {
      await eventService.setEventVisibility(event.eventId, nextVisible);
      toast.success(`Đã ${actionLabel} sự kiện thành công.`);
      onActionComplete?.();
    } catch (error) {
      console.error(error);
      toast.error(`Không thể ${actionLabel} sự kiện.`);
    }
  };

  return (
    <AppCard className="h-full flex flex-col">
      <div className="flex flex-col flex-1">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt={event.title}
            className="w-full h-40 object-cover rounded mb-4"
          />
        ) : (
          <div className="bg-gray-200 h-40 rounded mb-4 flex items-center justify-center text-gray-400 text-sm">
            Không có ảnh bìa
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
              Đã ẩn
            </span>
          )}

          {isAdmin && normalizedStatus === 'Ended' && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700">
              Tự động ẩn khỏi trang công khai
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{event.title}</h3>
          <p className="text-gray-600 text-sm mb-1">{event.location}</p>
          <p className="text-gray-500 text-xs mb-2">
            {new Date(event.startTime).toLocaleString('vi-VN')} —{' '}
            {new Date(event.endTime).toLocaleString('vi-VN')}
          </p>

          {!isAdmin && (
            <p className="text-sm text-gray-600 mb-3">
              {canRegisterForEvent(event.status, event.isFull)
                ? `${event.availableSlots} chỗ trống`
                : normalizedStatus === 'Ended'
                  ? 'Sự kiện đã kết thúc'
                  : normalizedStatus === 'Cancelled'
                    ? 'Sự kiện đã bị hủy'
                    : event.isFull
                      ? 'Đã hết chỗ đăng ký'
                      : 'Đăng ký hiện không khả dụng'}
            </p>
          )}

          {isAdmin && (
            <p className="text-sm text-gray-600 mb-3">
              {event.registeredCount}/{event.maxSlots} người đã đăng ký
            </p>
          )}
        </div>

        {isAdmin ? (
          <div className="mt-auto flex flex-col gap-2 pt-3">
            <button
              onClick={handleEdit}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Chỉnh sửa
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
                {event.isVisible ? 'Ẩn sự kiện' : 'Hiện sự kiện'}
              </button>
            )}
          </div>
        ) : (
          normalizedStatus === 'Active' && (
            <div className="mt-auto pt-3">
              <button
                onClick={() => navigate(`/events/${event.eventId}`)}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Xem chi tiết
              </button>
            </div>
          )
        )}
      </div>
    </AppCard>
  );
};
