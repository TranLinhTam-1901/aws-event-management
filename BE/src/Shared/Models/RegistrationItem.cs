using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Models
{
    public class RegistrationItem
    {
        public string RegistrationId { get; set; }
        public string EventId { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public RegistrationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
