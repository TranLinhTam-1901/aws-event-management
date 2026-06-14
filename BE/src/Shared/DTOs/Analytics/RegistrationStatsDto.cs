namespace EventManagement.Shared.DTOs.Analytics
{
    public class RegistrationStatsDto
    {
        public int TotalCount { get; set; }
        public int ConfirmedCount { get; set; }
        public int WaitingCount { get; set; }
        public int CancelledCount { get; set; }
    }
}
