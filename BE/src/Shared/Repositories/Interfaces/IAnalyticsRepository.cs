using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories.Interfaces
{
    public interface IAnalyticsRepository
    {
        Task<AnalyticsItem> GetByEventAsync(string eventId);
        Task<List<AnalyticsItem>> GetAllAsync();
        Task CreateAsync(AnalyticsItem item);
        Task UpdateAsync(AnalyticsItem item);
    }
}
