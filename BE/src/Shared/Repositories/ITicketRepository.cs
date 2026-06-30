using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories;

public interface ITicketRepository
{
    Task CreateAsync(TicketItem ticket);

    Task<List<TicketItem>> GetByUserIdAsync(string userId);

    Task<bool> HasTicketForEventAsync(string userId, string eventId);
}
