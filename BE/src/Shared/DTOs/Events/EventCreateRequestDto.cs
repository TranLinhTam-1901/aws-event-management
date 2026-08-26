namespace EventManagement.Shared.DTOs.Events
{
    public class EventCreateRequestDto
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string StartTime { get; set; } = string.Empty;

        public string EndTime { get; set; } = string.Empty;

        public string BannerUrl { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;
        public string CategoryId { get; set; } = string.Empty;

        public string SpeakerName { get; set; } = string.Empty;

        public string Prerequisites { get; set; } = string.Empty;

        public string RequiredTools { get; set; } = string.Empty;

        public int MaxSlots { get; set; }
    }
}