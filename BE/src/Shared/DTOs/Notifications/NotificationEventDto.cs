namespace EventManagement.Shared.DTOs.Notifications
{
    public class NotificationEventDto
    {
        public string EventId { get; set; }
        public string RegistrationId { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Type { get; set; }
        public Dictionary<string, string> Data { get; set; }
    }
}
