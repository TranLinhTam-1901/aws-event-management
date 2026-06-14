namespace EventManagement.Shared.DTOs.Attendance
{
    public class AttendanceListItemDto
    {
        public string TicketId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public DateTime CheckInAt { get; set; }
        public string CheckedBy { get; set; }
    }
}
