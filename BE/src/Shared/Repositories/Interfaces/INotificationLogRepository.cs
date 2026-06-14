using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories.Interfaces
{
    public interface INotificationLogRepository
    {
        Task<NotificationLogItem> GetByIdAsync(string notificationId);
        Task<List<NotificationLogItem>> GetByEventAsync(string eventId);
        Task<List<NotificationLogItem>> GetByEmailAsync(string email);
        Task<List<NotificationLogItem>> GetAllAsync();
        Task CreateAsync(NotificationLogItem item);
        Task UpdateAsync(NotificationLogItem item);
    }
}
