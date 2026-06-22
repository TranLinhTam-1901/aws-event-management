namespace EventManagement.Shared.DTOs.Users;

public class InitProfileResponseDto
{
    public bool IsNewUser { get; set; }
    public UserProfileDto Profile { get; set; } = new();
}