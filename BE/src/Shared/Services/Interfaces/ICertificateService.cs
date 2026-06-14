using EventManagement.Shared.DTOs.Certificates;

namespace EventManagement.Shared.Services.Interfaces
{
    public interface ICertificateService
    {
        Task<CertificateResponseDto> CreateCertificateAsync(CertificateCreateRequestDto dto);
        Task<List<MyCertificateDto>> GetUserCertificatesAsync(string userId);
        Task<CertificateDownloadDto> GetCertificateByIdAsync(string certificateId);
        Task GenerateAndUploadPdfAsync(string certificateId, string fullName, string eventTitle);
    }
}
