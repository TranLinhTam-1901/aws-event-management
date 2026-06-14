namespace EventManagement.Shared.DTOs.Attendance
{
    public class CheckInResponseDto
    {
        public bool Success { get; set; }
        public string TicketId { get; set; }
        public string FullName { get; set; }
        public string Message { get; set; }
    }
}
