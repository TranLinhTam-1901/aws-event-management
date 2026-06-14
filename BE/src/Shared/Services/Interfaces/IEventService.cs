using EventManagement.Shared.DTOs.Events;

namespace EventManagement.Shared.Services.Interfaces
{
    public interface IEventService
    {
        Task<List<EventListItemDto>> GetEventsAsync();
        Task<EventDetailDto> GetEventByIdAsync(string eventId);
        Task<EventDetailDto> CreateEventAsync(EventCreateRequestDto dto, string createdBy);
        Task UpdateEventAsync(string eventId, EventUpdateRequestDto dto);
        Task DeleteEventAsync(string eventId);
        Task UpdateEventStatusAsync(string eventId, EventStatusUpdateDto dto);
        Task<EventBannerUploadResponseDto> UploadBannerAsync(string eventId, string bannerUrl);
    }
}
