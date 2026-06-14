using EventManagement.Shared.DTOs.Registrations;

namespace EventManagement.Shared.Services.Interfaces
{
    public interface IRegistrationService
    {
        Task<RegisterEventResponseDto> RegisterEventAsync(string eventId, RegisterEventRequestDto dto, string userId);
        Task<List<RegistrationListItemDto>> GetRegistrationsByEventAsync(string eventId);
        Task<RegistrationDetailDto> GetRegistrationByIdAsync(string registrationId);
    }
}
