using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories.Interfaces
{
    public interface IUserProfileRepository
    {
        Task<UserProfileItem> GetByIdAsync(string userId);
        Task<UserProfileItem> GetByCognitoSubAsync(string cognitoSub);
        Task<UserProfileItem> GetByEmailAsync(string email);
        Task<List<UserProfileItem>> GetAllAsync();
        Task CreateAsync(UserProfileItem item);
        Task UpdateAsync(UserProfileItem item);
    }
}
