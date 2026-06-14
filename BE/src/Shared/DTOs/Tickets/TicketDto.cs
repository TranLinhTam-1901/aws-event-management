namespace EventManagement.Shared.DTOs.Tickets
{
    public class TicketDto
    {
        public string TicketId { get; set; }
        public string EventId { get; set; }
        public string RegistrationId { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Status { get; set; }
        public string QRCodeUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
