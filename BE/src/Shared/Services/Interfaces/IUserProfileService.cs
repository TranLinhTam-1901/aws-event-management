using EventManagement.Shared.DTOs.Users;

namespace EventManagement.Shared.Services.Interfaces
{
    public interface IUserProfileService
    {
        Task<UserProfileDto> GetUserProfileAsync(string userId);
        Task<UserProfileDto> UpdateUserProfileAsync(string userId, UserProfileUpdateRequestDto dto);
        Task<List<UserListItemDto>> GetAllUsersAsync();
        Task<UserProfileDto> GetUserByIdAsync(string userId);
    }
}
