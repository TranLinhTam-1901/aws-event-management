namespace EventManagement.Shared.DTOs.Notifications
{
    public class NotificationLogDto
    {
        public string NotificationId { get; set; }
        public string EventId { get; set; }
        public string Email { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime SentAt { get; set; }
    }
}
