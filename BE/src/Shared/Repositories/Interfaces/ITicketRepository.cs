using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories.Interfaces
{
    public interface ITicketRepository
    {
        Task<TicketItem> GetByIdAsync(string ticketId);
        Task<List<TicketItem>> GetByUserAsync(string userId);
        Task<List<TicketItem>> GetByEventAsync(string eventId);
        Task<TicketItem> GetByRegistrationAsync(string registrationId);
        Task CreateAsync(TicketItem item);
        Task UpdateAsync(TicketItem item);
        Task DeleteAsync(string ticketId);
    }
}
