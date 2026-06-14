namespace EventManagement.Shared.DTOs.Attendance
{
    public class AttendanceDto
    {
        public string EventId { get; set; }
        public string TicketId { get; set; }
        public string RegistrationId { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public DateTime CheckInAt { get; set; }
        public string CheckedBy { get; set; }
        public string Status { get; set; }
    }
}
