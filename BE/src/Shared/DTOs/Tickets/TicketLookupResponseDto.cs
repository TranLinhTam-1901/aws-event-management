namespace EventManagement.Shared.DTOs.Tickets
{
    public class TicketLookupResponseDto
    {
        public string TicketId { get; set; }
        public string EventTitle { get; set; }
        public string FullName { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
    }
}
