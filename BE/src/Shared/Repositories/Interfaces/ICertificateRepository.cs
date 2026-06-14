using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories.Interfaces
{
    public interface ICertificateRepository
    {
        Task<CertificateItem> GetByIdAsync(string certificateId);
        Task<List<CertificateItem>> GetByUserAsync(string userId);
        Task<List<CertificateItem>> GetByEventAsync(string eventId);
        Task<CertificateItem> GetByTicketAsync(string ticketId);
        Task CreateAsync(CertificateItem item);
        Task UpdateAsync(CertificateItem item);
    }
}
