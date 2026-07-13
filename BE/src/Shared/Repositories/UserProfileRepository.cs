using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Users;
using EventManagement.Shared.Mappers;
using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public UserProfileRepository(IAmazonDynamoDB dynamoDb, string tableName)
    {
        _dynamoDb = dynamoDb;
        _tableName = tableName;
    }

    public async Task<UserProfileDto?> GetByUserIdAsync(string userId)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [UserProfileFields.UserId] = new AttributeValue { S = userId }
            }
        });

        if (response.Item == null || response.Item.Count == 0)
        {
            return null;
        }

        return UserProfileDynamoMapper.FromDynamoItem(response.Item);
    }

    public async Task<List<UserProfileDto>> GetAllAsync()
    {
        var response = await _dynamoDb.ScanAsync(new ScanRequest
        {
            TableName = _tableName
        });

        return response.Items
            .Select(UserProfileDynamoMapper.FromDynamoItem)
            .ToList();
    }

    public async Task CreateAsync(UserProfileDto profile)
    {
        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = UserProfileDynamoMapper.ToDynamoItem(profile)
        });
    }

     public async Task UpdateLastLoginAsync(string userId, string updatedAt, UserRole role)
    {
        await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [UserProfileFields.UserId] = new AttributeValue { S = userId }
            },
            UpdateExpression = "SET #lastLoginAt = :lastLoginAt, #updatedAt = :updatedAt, #role = :role",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#lastLoginAt"] = UserProfileFields.LastLoginAt,
                ["#updatedAt"] = UserProfileFields.UpdatedAt,
                ["#role"] = UserProfileFields.Role
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":lastLoginAt"] = new AttributeValue { S = updatedAt },
                [":updatedAt"] = new AttributeValue { S = updatedAt },
                [":role"] = new AttributeValue { S = role.ToString() }
            }
        });
    }

    public async Task UpdateProfileAsync(string userId, string fullName, string avatarUrl, string updatedAt)
    {
        await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [UserProfileFields.UserId] = new AttributeValue { S = userId }
            },
            UpdateExpression = "SET #fullName = :fullName, #avatarUrl = :avatarUrl, #updatedAt = :updatedAt",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#fullName"] = UserProfileFields.FullName,
                ["#avatarUrl"] = UserProfileFields.AvatarUrl,
                ["#updatedAt"] = UserProfileFields.UpdatedAt
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":fullName"] = new AttributeValue { S = fullName },
                [":avatarUrl"] = new AttributeValue { S = avatarUrl },
                [":updatedAt"] = new AttributeValue { S = updatedAt }
            }
        });
    }

    public async Task UpdateStatusAsync(string userId, UserStatus status, string updatedAt)
    {
        await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [UserProfileFields.UserId] = new AttributeValue { S = userId }
            },
            UpdateExpression = "SET #status = :status, #updatedAt = :updatedAt",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#status"] = UserProfileFields.Status,
                ["#updatedAt"] = UserProfileFields.UpdatedAt
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":status"] = new AttributeValue { S = status.ToString() },
                [":updatedAt"] = new AttributeValue { S = updatedAt }
            }
        });
    }
}