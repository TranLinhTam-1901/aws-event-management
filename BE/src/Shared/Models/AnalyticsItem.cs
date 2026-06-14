namespace EventManagement.Shared.Models
{
    public class AnalyticsItem
    {
        public string AnalyticsId { get; set; }
        public string EventId { get; set; }
        public int TotalRegistrations { get; set; }
        public int ConfirmedCount { get; set; }
        public int WaitingCount { get; set; }
        public int CheckInCount { get; set; }
        public double AttendanceRate { get; set; }
        public int EmailSentCount { get; set; }
        public int EmailFailedCount { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
