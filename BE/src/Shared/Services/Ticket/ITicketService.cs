using EventManagement.Shared.DTOs.Tickets;

namespace EventManagement.Shared.Services
{
    public interface ITicketService
    {
        Task<TicketResponseDto> RegisterTicketAsync(string eventId, string userId, string userEmail, string userFullName);
        Task<List<TicketResponseDto>> GetUserTicketsAsync(string userId);
    }
}