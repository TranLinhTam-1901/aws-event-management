using EventManagement.Shared.DTOs.Users;

namespace EventManagement.Shared.Services;

public interface IUserProfileService
{
    Task<InitProfileResponseDto> InitProfileAsync(
        string userId,
        string email,
        string fullName,
        bool isAdmin = false
    );

    Task<UserProfileDto?> GetMyProfileAsync(string userId);
}