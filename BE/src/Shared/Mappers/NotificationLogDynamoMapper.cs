using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Notifications;

namespace EventManagement.Shared.Mappers;

public static class NotificationLogDynamoMapper
{
    public static Dictionary<string, AttributeValue> ToDynamoItem(NotificationLogDto item)
    {
        var dict = new Dictionary<string, AttributeValue>
        {
            [NotificationFields.NotificationId] = new AttributeValue { S = item.NotificationId },
            [NotificationFields.EventId] = new AttributeValue { S = item.EventId ?? string.Empty },
            [NotificationFields.Email] = new AttributeValue { S = item.Email ?? string.Empty },
            [NotificationFields.Type] = new AttributeValue { S = item.Type },
            [NotificationFields.Status] = new AttributeValue { S = item.Status },
            [NotificationFields.SentAt] = new AttributeValue { S = item.SentAt.ToString("O") }
        };

        // ErrorMessage chỉ ghi khi có lỗi, tránh lưu chuỗi rỗng gây rối log
        if (!string.IsNullOrEmpty(item.ErrorMessage))
        {
            dict[NotificationFields.ErrorMessage] = new AttributeValue { S = item.ErrorMessage };
        }

        return dict;
    }

    public static NotificationLogDto FromDynamoItem(Dictionary<string, AttributeValue> item)
    {
        return new NotificationLogDto
        {
            NotificationId = GetString(item, NotificationFields.NotificationId),
            EventId = GetString(item, NotificationFields.EventId),
            Email = GetString(item, NotificationFields.Email),
            Type = GetString(item, NotificationFields.Type),
            Status = GetString(item, NotificationFields.Status),
            ErrorMessage = item.TryGetValue(NotificationFields.ErrorMessage, out var err) ? err.S : null,
            SentAt = item.TryGetValue(NotificationFields.SentAt, out var sentAt)
                && DateTime.TryParse(sentAt.S, out var parsed)
                ? parsed
                : DateTime.MinValue
        };
    }

    private static string GetString(Dictionary<string, AttributeValue> item, string key)
        => item.TryGetValue(key, out var value) ? value.S ?? string.Empty : string.Empty;
}