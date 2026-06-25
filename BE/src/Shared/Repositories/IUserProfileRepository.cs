using EventManagement.Shared.DTOs.Users;
using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Repositories;

public interface IUserProfileRepository
{
    Task<UserProfileDto?> GetByUserIdAsync(string userId);
    Task CreateAsync(UserProfileDto profile);
    Task UpdateLastLoginAsync(string userId, string updatedAt, UserRole role);

    Task UpdateProfileAsync(string userId, string fullName, string avatarUrl, string updatedAt);
}