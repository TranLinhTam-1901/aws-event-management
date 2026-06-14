using EventManagement.Shared.DTOs.Tickets;

namespace EventManagement.Shared.Services.Interfaces
{
    public interface ITicketService
    {
        Task<TicketDto> CreateTicketAsync(string eventId, string registrationId, string userId, string fullName, string email);
        Task<List<MyTicketDto>> GetUserTicketsAsync(string userId);
        Task<TicketDetailDto> GetTicketByIdAsync(string ticketId);
        Task<TicketLookupResponseDto> LookupTicketAsync(string ticketId);
    }
}
