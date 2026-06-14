using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories.Interfaces
{
    public interface IEventRepository
    {
        Task<EventItem> GetByIdAsync(string eventId);
        Task<List<EventItem>> GetAllAsync();
        Task<List<EventItem>> GetByStatusAsync(string status);
        Task CreateAsync(EventItem item);
        Task UpdateAsync(EventItem item);
        Task DeleteAsync(string eventId);
    }
}
