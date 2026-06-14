namespace EventManagement.Shared.DTOs.Events
{
    public class EventListItemDto
    {
        public string EventId { get; set; }
        public string Title { get; set; }
        public string Location { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int TotalSlots { get; set; }
        public int AvailableSlots { get; set; }
        public string BannerUrl { get; set; }
        public string Status { get; set; }
    }
}
