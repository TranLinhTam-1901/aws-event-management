using EventManagement.Shared.DTOs.Events;

namespace EventManagement.Shared.Services;

public interface IEventService
{
    Task<List<EventResponseDto>> GetPublicEventsAsync();

    Task<List<EventResponseDto>> GetAdminEventsAsync();

    Task<EventResponseDto?> GetPublicEventByIdAsync(string eventId);

    Task<EventResponseDto?> GetAdminEventByIdAsync(string eventId);

    Task<EventResponseDto> CreateEventAsync(
        EventCreateRequestDto request);

    Task<EventResponseDto> UpdateEventAsync(
        string eventId,
        EventUpdateRequestDto request);

    Task SetEventVisibilityAsync(string eventId, bool isVisible);

    Task<GetEventBannerUploadUrlResponseDto> GenerateBannerUploadUrlAsync(
        string? eventId,
        string contentType);
}
