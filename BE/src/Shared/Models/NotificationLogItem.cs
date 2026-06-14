using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Models
{
    public class NotificationLogItem
    {
        public string NotificationId { get; set; }
        public string EventId { get; set; }
        public string UserId { get; set; }
        public string Email { get; set; }
        public NotificationType Type { get; set; }
        public NotificationStatus Status { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime SentAt { get; set; }
    }
}
