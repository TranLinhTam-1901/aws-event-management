namespace EventManagement.Shared.DTOs.Analytics
{
    public class AttendanceStatsDto
    {
        public int TotalAttended { get; set; }
        public int TotalExpected { get; set; }
        public double AttendanceRate { get; set; }
    }
}
