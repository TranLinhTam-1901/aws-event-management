namespace EventManagement.Shared.DTOs.Notifications
{
    public class SendEmailRequestDto
    {
        public string ToEmail { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public string FullName { get; set; }
    }
}
