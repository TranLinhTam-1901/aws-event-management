using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.Models;
using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Mappers;

public static class TicketDynamoMapper
{
    public static Dictionary<string, AttributeValue> ToDynamoItem(TicketItem item)
    {
        return new Dictionary<string, AttributeValue>
        {
            [TicketFields.TicketId] = new AttributeValue { S = item.TicketId },
            [TicketFields.EventId] = new AttributeValue { S = item.EventId },
            [TicketFields.RegistrationId] = new AttributeValue { S = item.RegistrationId },
            [TicketFields.UserId] = new AttributeValue { S = item.UserId },
            [TicketFields.FullName] = new AttributeValue { S = item.FullName },
            [TicketFields.Email] = new AttributeValue { S = item.Email },
            [TicketFields.Phone] = new AttributeValue { S = item.Phone ?? string.Empty },
            [TicketFields.Status] = new AttributeValue { S = item.Status.ToString() },
            [TicketFields.CreatedAt] = new AttributeValue { S = item.CreatedAt.ToString("O") }
        };
    }

    public static TicketItem FromDynamoItem(Dictionary<string, AttributeValue> item)
    {
        Enum.TryParse<TicketStatus>(GetString(item, TicketFields.Status), true, out var status);

        return new TicketItem
        {
            TicketId = GetString(item, TicketFields.TicketId),
            EventId = GetString(item, TicketFields.EventId),
            RegistrationId = GetString(item, TicketFields.RegistrationId),
            UserId = GetString(item, TicketFields.UserId),
            FullName = GetString(item, TicketFields.FullName),
            Email = GetString(item, TicketFields.Email),
            Phone = GetString(item, TicketFields.Phone),
            Status = status == default ? TicketStatus.Confirmed : status,
            CreatedAt = DateTime.TryParse(GetString(item, TicketFields.CreatedAt), out var createdAt)
                ? createdAt
                : DateTime.UtcNow
        };
    }

    private static string GetString(Dictionary<string, AttributeValue> item, string key) =>
        item.TryGetValue(key, out var value) ? value.S ?? string.Empty : string.Empty;
}
