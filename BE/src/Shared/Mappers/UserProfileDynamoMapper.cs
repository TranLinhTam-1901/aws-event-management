using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Users;
using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Mappers;

public static class UserProfileDynamoMapper
{
    public static Dictionary<string, AttributeValue> ToDynamoItem(UserProfileDto profile)
    {
        return new Dictionary<string, AttributeValue>
        {
            [UserProfileFields.UserId] = new AttributeValue { S = profile.UserId },
            [UserProfileFields.Email] = new AttributeValue { S = profile.Email },
            [UserProfileFields.FullName] = new AttributeValue { S = profile.FullName },
            [UserProfileFields.AvatarUrl] = new AttributeValue { S = profile.AvatarUrl },
            [UserProfileFields.Role] = new AttributeValue { S = profile.Role.ToString() },
            [UserProfileFields.Status] = new AttributeValue { S = profile.Status.ToString() },
            [UserProfileFields.CreatedAt] = new AttributeValue { S = profile.CreatedAt },
            [UserProfileFields.UpdatedAt] = new AttributeValue { S = profile.UpdatedAt },
            [UserProfileFields.LastLoginAt] = new AttributeValue { S = profile.LastLoginAt }
        };
    }

    public static UserProfileDto FromDynamoItem(Dictionary<string, AttributeValue> item)
    {
        return new UserProfileDto
        {
            UserId = GetString(item, UserProfileFields.UserId),
            Email = GetString(item, UserProfileFields.Email),
            FullName = GetString(item, UserProfileFields.FullName),
            AvatarUrl = GetString(item, UserProfileFields.AvatarUrl),
            Role = Enum.TryParse<UserRole>(
                GetString(item, UserProfileFields.Role),
                out var role
            )
                ? role
                : UserRole.USER,
            Status = Enum.TryParse<UserStatus>(
                GetString(item, UserProfileFields.Status),
                out var status
            )
                ? status
                : UserStatus.ACTIVE,
            CreatedAt = GetString(item, UserProfileFields.CreatedAt),
            UpdatedAt = GetString(item, UserProfileFields.UpdatedAt),
            LastLoginAt = GetString(item, UserProfileFields.LastLoginAt)
        };
    }

    private static string GetString(
        Dictionary<string, AttributeValue> item,
        string key
    )
    {
        return item.TryGetValue(key, out var value)
            ? value.S ?? string.Empty
            : string.Empty;
    }
}