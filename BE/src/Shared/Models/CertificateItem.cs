using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Models
{
    public class CertificateItem
    {
        public string CertificateId { get; set; }
        public string EventId { get; set; }
        public string TicketId { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string CertificateUrl { get; set; }
        public CertificateStatus Status { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}
