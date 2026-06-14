namespace EventManagement.Shared.DTOs.Notifications
{
    public class ReminderScheduleDto
    {
        public string EventId { get; set; }
        public string EventTitle { get; set; }
        public DateTime ReminderTime { get; set; }
    }
}
