using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories.Interfaces
{
    public interface IRegistrationRepository
    {
        Task<RegistrationItem> GetByIdAsync(string registrationId);
        Task<List<RegistrationItem>> GetByEventAsync(string eventId);
        Task<List<RegistrationItem>> GetByUserAsync(string userId);
        Task<RegistrationItem> GetByEmailAndEventAsync(string email, string eventId);
        Task CreateAsync(RegistrationItem item);
        Task UpdateAsync(RegistrationItem item);
        Task DeleteAsync(string registrationId);
    }
}
