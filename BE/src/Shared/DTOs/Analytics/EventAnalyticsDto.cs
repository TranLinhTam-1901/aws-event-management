namespace EventManagement.Shared.DTOs.Analytics
{
    public class EventAnalyticsDto
    {
        public string EventId { get; set; }
        public string EventTitle { get; set; }
        public int TotalRegistrations { get; set; }
        public int ConfirmedCount { get; set; }
        public int WaitingCount { get; set; }
        public int CheckInCount { get; set; }
        public double AttendanceRate { get; set; }
    }
}
