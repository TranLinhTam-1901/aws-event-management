namespace EventManagement.Shared.DTOs.Users;

public class UpdateProfileRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
}