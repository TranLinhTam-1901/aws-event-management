using EventManagement.Shared.DTOs.Notifications;

namespace EventManagement.Shared.Services.Interfaces
{
    public interface INotificationService
    {
        Task SendRegistrationConfirmedEmailAsync(NotificationEventDto eventDto);
        Task SendWaitingListEmailAsync(NotificationEventDto eventDto);
        Task SendEventReminderEmailAsync(NotificationEventDto eventDto);
        Task SendCertificateReadyEmailAsync(NotificationEventDto eventDto);
        Task<List<NotificationLogDto>> GetNotificationLogsAsync(string eventId = null);
        Task<NotificationLogDto> SendManualEmailAsync(SendEmailRequestDto dto);
    }
}
