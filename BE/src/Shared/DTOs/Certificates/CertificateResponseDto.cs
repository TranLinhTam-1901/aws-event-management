namespace EventManagement.Shared.DTOs.Certificates
{
    public class CertificateResponseDto
    {
        public string CertificateId { get; set; }
        public string EventId { get; set; }
        public string FullName { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
    }
}
