
namespace EventManagement.Shared.DTOs.Events
{
    public class EventResponseDto
    {
        public string EventId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public bool IsVisible { get; set; } = true;
        public string BannerUrl { get; set; } = string.Empty;
        public string BannerDisplayUrl { get; set; } = string.Empty;

        // Metadata IT Workshop
        public string Category { get; set; } = string.Empty;
        public string CategoryId { get; set; } = string.Empty;
        public string SpeakerName { get; set; } = string.Empty;
        public string Prerequisites { get; set; } = string.Empty;
        public string RequiredTools { get; set; } = string.Empty;

        // Trạng thái slot chỗ ngồi
        public int MaxSlots { get; set; }
        public int RegisteredCount { get; set; }
        
        // Thuộc tính tính toán nhanh để FE hiển thị trạng thái nút bấm
        public bool IsFull => RegisteredCount >= MaxSlots;
        public int AvailableSlots => Math.Max(0, MaxSlots - RegisteredCount);
    }
}