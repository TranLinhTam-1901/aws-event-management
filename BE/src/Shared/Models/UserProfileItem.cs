using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Models.Users;

public class UserProfile
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.USER;
    public UserStatus Status { get; set; } = UserStatus.ACTIVE;
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
    public string LastLoginAt { get; set; } = string.Empty;
}