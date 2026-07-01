using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.Mappers;
using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public TicketRepository(IAmazonDynamoDB dynamoDb, string tableName)
    {
        _dynamoDb = dynamoDb;
        _tableName = tableName;
    }

    public async Task CreateAsync(TicketItem ticket)
    {
        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = TicketDynamoMapper.ToDynamoItem(ticket)
        });
    }

    public async Task<List<TicketItem>> GetByUserIdAsync(string userId)
    {
        var response = await _dynamoDb.QueryAsync(new QueryRequest
        {
            TableName = _tableName,
            IndexName = "UserTicketsIndex",
            KeyConditionExpression = "UserId = :userId",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":userId"] = new AttributeValue { S = userId }
            }
        });

        return response.Items
            .Select(TicketDynamoMapper.FromDynamoItem)
            .OrderByDescending(t => t.CreatedAt)
            .ToList();
    }

    public async Task<bool> HasTicketForEventAsync(string userId, string eventId)
    {
        var tickets = await GetByUserIdAsync(userId);

        return tickets.Any(t =>
            t.EventId == eventId &&
            t.Status != Models.Enums.TicketStatus.Cancelled);
    }
}
