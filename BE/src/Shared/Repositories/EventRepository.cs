using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.Mappers;
using EventManagement.Shared.DTOs.Events;

using EventManagement.Shared.Helpers;

namespace EventManagement.Shared.Repositories;

public class EventRepository : IEventRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public EventRepository(
        IAmazonDynamoDB dynamoDb,
        string tableName)
    {
        _dynamoDb = dynamoDb;
        _tableName = tableName;
    }

    public async Task<List<EventResponseDto>> GetAllAsync()
    {
        var response = await _dynamoDb.ScanAsync(
            new ScanRequest
            {
                TableName = _tableName
            });

        return response.Items
            .Select(EventDynamoMapper.FromDynamoItem)
            .ToList();
    }

    public async Task<EventResponseDto?> GetByIdAsync(
        string eventId)
    {
        var response = await _dynamoDb.GetItemAsync(
            new GetItemRequest
            {
                TableName = _tableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [EventFields.EventId] =
                        new AttributeValue
                        {
                            S = eventId
                        }
                }
            });

        if (response.Item == null ||
            response.Item.Count == 0)
        {
            return null;
        }

        return EventDynamoMapper
            .FromDynamoItem(response.Item);
    }

    public async Task CreateAsync(
        EventResponseDto eventItem)
    {
        await _dynamoDb.PutItemAsync(
            new PutItemRequest
            {
                TableName = _tableName,
                Item = EventDynamoMapper
                    .ToDynamoItem(eventItem)
            });
    }

    public async Task UpdateAsync(
        EventResponseDto eventItem)
    {
        await _dynamoDb.PutItemAsync(
            new PutItemRequest
            {
                TableName = _tableName,
                Item = EventDynamoMapper
                    .ToDynamoItem(eventItem)
            });
    }

    public async Task SetVisibilityAsync(string eventId, bool isVisible)
    {
        await _dynamoDb.UpdateItemAsync(
            new UpdateItemRequest
            {
                TableName = _tableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [EventFields.EventId] = new AttributeValue { S = eventId }
                },
                UpdateExpression = "SET #visible = :visible",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#visible"] = EventFields.IsVisible
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":visible"] = new AttributeValue { BOOL = isVisible }
                }
            });
    }

    public async Task<bool> TryIncrementRegisteredCountAsync(string eventId)
    {
        try
        {
            await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
            {
                TableName = _tableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [EventFields.EventId] = new AttributeValue { S = eventId }
                },
                UpdateExpression = "SET RegisteredCount = RegisteredCount + :inc",
                ConditionExpression =
                    "RegisteredCount < MaxSlots AND #status = :active AND IsVisible = :visible",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#status"] = EventFields.Status
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":inc"] = new AttributeValue { N = "1" },
                    [":active"] = new AttributeValue { S = EventStatusHelper.Active },
                    [":visible"] = new AttributeValue { BOOL = true }
                }
            });

            return true;
        }
        catch (ConditionalCheckFailedException)
        {
            return false;
        }
    }

    public async Task TryDecrementRegisteredCountAsync(string eventId)
    {
        try
        {
            await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
            {
                TableName = _tableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [EventFields.EventId] = new AttributeValue { S = eventId }
                },
                UpdateExpression = "SET RegisteredCount = RegisteredCount - :dec",
                ConditionExpression = "RegisteredCount > :zero",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":dec"] = new AttributeValue { N = "1" },
                    [":zero"] = new AttributeValue { N = "0" }
                }
            });
        }
        catch (ConditionalCheckFailedException)
        {
            // Ignore rollback failure.
        }
    }
}