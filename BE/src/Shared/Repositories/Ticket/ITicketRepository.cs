using EventManagement.Shared.DTOs.Tickets;
using EventManagement.Shared.DTOs.Events;

namespace EventManagement.Shared.Repositories
{
    public interface ITicketRepository
    {
        Task<EventResponseDto?> GetEventByIdAsync(string eventId);
        Task CreateTicketAsync(TicketResponseDto ticketDto);
        Task UpdateEventIncrementRegisteredCountAsync(string eventId);
        Task<List<TicketResponseDto>> GetTicketsByUserIdAsync(string userId);
    }
}