using EventManagement.Shared.DTOs.Registrations;
using EventManagement.Shared.DTOs.Tickets;

namespace EventManagement.Shared.Services;

public interface IRegistrationService
{
    Task<RegisterEventResponseDto> RegisterForEventAsync(
        string eventId,
        string userId,
        RegisterEventRequestDto request);

    Task<List<TicketListItemDto>> GetMyTicketsAsync(string userId);
}
