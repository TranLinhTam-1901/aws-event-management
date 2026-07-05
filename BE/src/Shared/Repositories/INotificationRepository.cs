using EventManagement.Shared.DTOs.Events;
using EventManagement.Shared.DTOs.Notifications;
using EventManagement.Shared.DTOs.Tickets;

namespace EventManagement.Shared.Repositories;

public interface INotificationRepository
{
    Task LogNotificationAsync(NotificationLogDto log);
    Task<List<NotificationLogDto>> GetAllLogsAsync();

    // Dùng cho tính năng nhắc lịch (Schedule Reminder)
    Task<List<EventResponseDto>> GetUpcomingEventsAsync(DateTime fromTime, DateTime toTime);
    Task<List<TicketResponseDto>> GetConfirmedTicketsByEventIdAsync(string eventId);
}