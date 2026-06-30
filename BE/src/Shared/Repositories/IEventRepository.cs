using EventManagement.Shared.DTOs.Events;

namespace EventManagement.Shared.Repositories;

public interface IEventRepository
{
    Task<List<EventResponseDto>> GetAllAsync();

    Task<EventResponseDto?> GetByIdAsync(string eventId);

    Task CreateAsync(EventResponseDto eventItem);

    Task UpdateAsync(EventResponseDto eventItem);

    Task SetVisibilityAsync(string eventId, bool isVisible);

    Task<bool> TryIncrementRegisteredCountAsync(string eventId);

    Task TryDecrementRegisteredCountAsync(string eventId);
}