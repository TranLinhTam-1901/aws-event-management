using EventManagement.Shared.DTOs.Users;
using EventManagement.Shared.Models.Enums;
using EventManagement.Shared.Repositories;

namespace EventManagement.Shared.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IUserProfileRepository _userProfileRepository;

    public UserProfileService(IUserProfileRepository userProfileRepository)
    {
        _userProfileRepository = userProfileRepository;
    }

    public async Task<InitProfileResponseDto> InitProfileAsync(
        string userId,
        string email,
        string fullName,
        bool isAdmin = false
    )
    {
        var now = DateTime.UtcNow.ToString("O");

        var existingProfile = await _userProfileRepository.GetByUserIdAsync(userId);

        var role = isAdmin ? UserRole.ADMIN : UserRole.USER;
        
        if (existingProfile == null)
        {
            var newProfile = new UserProfileDto
            {
                UserId = userId,
                Email = email,
                FullName = fullName,
                AvatarUrl = string.Empty,
                Role = role,
                Status = UserStatus.ACTIVE,
                CreatedAt = now,
                UpdatedAt = now,
                LastLoginAt = now
            };

            await _userProfileRepository.CreateAsync(newProfile);

            return new InitProfileResponseDto
            {
                IsNewUser = true,
                Profile = newProfile
            };
        }

        await _userProfileRepository.UpdateLastLoginAsync(userId, now, role);

        existingProfile.UpdatedAt = now;
        existingProfile.LastLoginAt = now;
        existingProfile.Role = role;

        return new InitProfileResponseDto
        {
            IsNewUser = false,
            Profile = existingProfile
        };
    }

    public async Task<UserProfileDto?> GetMyProfileAsync(string userId)
    {
        return await _userProfileRepository.GetByUserIdAsync(userId);
    }
}