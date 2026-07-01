namespace EventManagement.Shared.DTOs.Tickets;

public class TicketListItemDto
{
    public string TicketId { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string RegistrationId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}
