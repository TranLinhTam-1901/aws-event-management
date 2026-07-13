using EventManagement.Shared.DTOs.Users;
using EventManagement.Shared.Models.Enums;

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
    Task<List<UserProfileDto>> GetAllProfilesAsync();
    Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto dto);
    Task<UserProfileDto> SetUserStatusAsync(string userId, UserStatus status);
    Task<GetAvatarUploadUrlResponseDto> GenerateAvatarUploadUrlAsync(string userId, string contentType);
}