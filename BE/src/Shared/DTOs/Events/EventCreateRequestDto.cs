namespace EventManagement.Shared.DTOs.Events
{
    public class EventCreateRequestDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int TotalSlots { get; set; }
    }
}
