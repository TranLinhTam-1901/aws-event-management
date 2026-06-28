namespace EventManagement.Shared.DTOs.Attendance
{
    public class CheckInRequestDto
    {
        public string TicketId { get; set; } = string.Empty;
        public string Method { get; set; } = "QR";
    }
}
