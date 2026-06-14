namespace EventManagement.Shared.DTOs.Analytics
{
    public class NotificationStatsDto
    {
        public int TotalSent { get; set; }
        public int TotalFailed { get; set; }
        public int TotalPending { get; set; }
    }
}
