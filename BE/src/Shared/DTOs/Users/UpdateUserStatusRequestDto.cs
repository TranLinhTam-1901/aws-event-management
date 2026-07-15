using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.DTOs.Users;

public class UpdateUserStatusRequestDto
{
    public UserStatus Status { get; set; } = UserStatus.ACTIVE;
}
