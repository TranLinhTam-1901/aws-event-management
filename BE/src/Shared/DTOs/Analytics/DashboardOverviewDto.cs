namespace EventManagement.Shared.DTOs.Analytics
{
    public class DashboardOverviewDto
    {
        public int TotalEvents { get; set; }
        public int TotalRegistrations { get; set; }
        public int ConfirmedRegistrations { get; set; }
        public int WaitingRegistrations { get; set; }
        public int TotalCheckIns { get; set; }
        public double AverageAttendanceRate { get; set; }
        public int EmailSentCount { get; set; }
        public int EmailFailedCount { get; set; }
        public int CertificatesIssuedCount { get; set; }
    }
}
