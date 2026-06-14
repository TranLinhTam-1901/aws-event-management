namespace EventManagement.Shared.DTOs.Certificates
{
    public class MyCertificateDto
    {
        public string CertificateId { get; set; }
        public string EventId { get; set; }
        public string EventTitle { get; set; }
        public string CertificateUrl { get; set; }
        public string Status { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}
