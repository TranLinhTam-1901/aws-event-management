import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppButton } from '../common/AppButton';
import eventService from '../../services/eventService';
import registrationService from '../../services/registrationService';
import { ticketService } from '../../services/ticketService';
import type { Event } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import {
  canRegisterForEvent,
  getEventBannerSrc,
  getEventStatusBadgeClass,
  getEventStatusLabel,
  normalizeEventStatus,
  REGISTRATION_MESSAGES,
} from '../../utils/eventStatusUtils';

export const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    if (!eventId) {
      return;
    }

    setLoading(true);
    try {
      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (error) {
      console.error(error);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const checkRegistrationStatus = useCallback(async () => {
    if (!eventId || !isAuthenticated) {
      setIsAlreadyRegistered(false);
      return;
    }

    try {
      const registered = await registrationService.hasRegisteredForEvent(eventId);
      setIsAlreadyRegistered(registered);
    } catch (error) {
      console.error(error);
      setIsAlreadyRegistered(false);
    }
  }, [eventId, isAuthenticated]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    checkRegistrationStatus();
  }, [checkRegistrationStatus]);

  // const handleRegistrationSuccess = () => {
  //   setRegistrationSuccess(true);
  //   setIsAlreadyRegistered(true);
  //   loadEvent();
  // };

  const handleRegistrationBlocked = () => {
    setRegisterMessage(null);
    loadEvent();
    checkRegistrationStatus();
  };

  const handleRegister = async () => {
    if (!event) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsRegistering(true);
      setRegisterMessage(null);
      await ticketService.registerTicket(event.eventId);
      setRegistrationSuccess(true);
      setIsAlreadyRegistered(true);
      setRegisterMessage('Đăng ký sự kiện thành công.');
      await loadEvent();
    } catch (error) {
      console.error('Register event error', error);
      setRegisterMessage('Đăng ký thất bại. Vui lòng thử lại.');
      handleRegistrationBlocked();
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Đang tải thông tin sự kiện...</div>;
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Không tìm thấy sự kiện hoặc sự kiện không khả dụng.</p>
        <AppButton variant="secondary" onClick={() => navigate('/events')}>
          Quay lại danh sách sự kiện
        </AppButton>
      </div>
    );
  }

  const normalizedStatus = normalizeEventStatus(event.status);
  const canRegister = canRegisterForEvent(
    event.status,
    event.isFull,
    isAlreadyRegistered
  );
  const bannerSrc = getEventBannerSrc(event);

  const getRegistrationMessage = (): string => {
    if (registrationSuccess || isAlreadyRegistered) {
      return REGISTRATION_MESSAGES.alreadyRegistered;
    }
    if (normalizedStatus === 'Ended') {
      return REGISTRATION_MESSAGES.ended;
    }
    if (normalizedStatus === 'Cancelled') {
      return REGISTRATION_MESSAGES.cancelled;
    }
    if (event.isFull) {
      return REGISTRATION_MESSAGES.full;
    }
    if (!canRegister) {
      return REGISTRATION_MESSAGES.unavailable;
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {bannerSrc ? (
        <img
          src={bannerSrc}
          alt={event.title}
          className="w-full h-72 object-cover"
        />
      ) : (
        <div className="bg-gray-200 h-72 flex items-center justify-center text-gray-400">
          No banner image
        </div>
      )}

      <div className="p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${getEventStatusBadgeClass(event.status)}`}
          >
            {getEventStatusLabel(event.status)}
          </span>
          {event.category && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {event.category}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm">Địa điểm</p>
            <p className="text-lg font-semibold">{event.location}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Người diễn giả</p>
            <p className="text-lg font-semibold">{event.speakerName || 'Sẽ cập nhật'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Thời gian bắt đầu</p>
            <p className="text-lg font-semibold">
              {new Date(event.startTime).toLocaleString('vi-VN')}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Thời gian kết thúc</p>
            <p className="text-lg font-semibold">
              {new Date(event.endTime).toLocaleString('vi-VN')}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Số chỗ còn lại</p>
            <p className="text-lg font-semibold">
              {event.isFull
                ? 'Đã hết slot đăng ký'
                : `${event.availableSlots} / ${event.maxSlots}`}
            </p>
          </div>
        </div>

        <div className="border-t pt-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Mô tả</h2>
          <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
        </div>

        {event.prerequisites && (
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-bold mb-2">Điều kiện tiên quyết</h2>
            <p className="text-gray-600 whitespace-pre-line">{event.prerequisites}</p>
          </div>
        )}

        {event.requiredTools && (
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-bold mb-2">Công cụ cần chuẩn bị</h2>
            <p className="text-gray-600 whitespace-pre-line">{event.requiredTools}</p>
          </div>
        )}

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Đăng ký</h2>

          {registrationSuccess ? (
            <div className="space-y-3 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
              <div>{REGISTRATION_MESSAGES.success}</div>
              <AppButton variant="secondary" onClick={() => navigate('/my-tickets')}>
                Xem vé của tôi
              </AppButton>
            </div>
          ) : canRegister ? (
            <div className="space-y-3">
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="px-5 py-3 bg-blue-700 text-white rounded-xl font-medium hover:bg-blue-800 disabled:opacity-60"
              >
                {isRegistering ? 'Đang đăng ký...' : 'Đăng ký sự kiện'}
              </button>
              {registerMessage && (
                <div className="text-sm text-gray-600">{registerMessage}</div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-gray-700">
              {getRegistrationMessage()}
              {isAlreadyRegistered && (
                <div className="mt-3">
                  <AppButton variant="secondary" onClick={() => navigate('/my-tickets')}>
                    Xem vé của tôi
                  </AppButton>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
