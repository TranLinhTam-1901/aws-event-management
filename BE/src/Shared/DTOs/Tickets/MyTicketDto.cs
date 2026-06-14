namespace EventManagement.Shared.DTOs.Tickets
{
    public class MyTicketDto
    {
        public string TicketId { get; set; }
        public string EventId { get; set; }
        public string EventTitle { get; set; }
        public string Status { get; set; }
        public string QRCodeUrl { get; set; }
        public DateTime EventStartTime { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
