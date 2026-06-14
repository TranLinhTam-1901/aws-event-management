namespace EventManagement.Shared.DTOs.Registrations
{
    public class RegistrationListItemDto
    {
        public string RegistrationId { get; set; }
        public string EventId { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
