using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Events;

namespace EventManagement.Shared.Mappers;

public static class EventDynamoMapper
{
    public static Dictionary<string, AttributeValue> ToDynamoItem(EventResponseDto item)
    {
        return new Dictionary<string, AttributeValue>
        {
            [EventFields.EventId] = new AttributeValue { S = item.EventId },

            [EventFields.Title] = new AttributeValue { S = item.Title },

            [EventFields.Description] = new AttributeValue { S = item.Description },

            [EventFields.Location] = new AttributeValue { S = item.Location },

            [EventFields.StartTime] = new AttributeValue { S = item.StartTime },

            [EventFields.EndTime] = new AttributeValue { S = item.EndTime },

            [EventFields.Status] = new AttributeValue { S = item.Status },

            [EventFields.BannerUrl] = new AttributeValue
            {
                S = item.BannerUrl ?? string.Empty
            },

            [EventFields.Category] = new AttributeValue
            {
                S = item.Category ?? string.Empty
            },

            [EventFields.SpeakerName] = new AttributeValue
            {
                S = item.SpeakerName ?? string.Empty
            },

            [EventFields.Prerequisites] = new AttributeValue
            {
                S = item.Prerequisites ?? string.Empty
            },

            [EventFields.RequiredTools] = new AttributeValue
            {
                S = item.RequiredTools ?? string.Empty
            },

            [EventFields.MaxSlots] = new AttributeValue
            {
                N = item.MaxSlots.ToString()
            },

            [EventFields.RegisteredCount] = new AttributeValue
            {
                N = item.RegisteredCount.ToString()
            },

            [EventFields.IsVisible] = new AttributeValue
            {
                BOOL = item.IsVisible
            },

            [EventFields.CategoryId] = new AttributeValue
            {
                S = item.CategoryId ?? string.Empty
            }
        };
    }

    public static EventResponseDto FromDynamoItem(
        Dictionary<string, AttributeValue> item)
    {
        return new EventResponseDto
        {
            EventId = GetString(item, EventFields.EventId),

            Title = GetString(item, EventFields.Title),

            Description = GetString(item, EventFields.Description),

            Location = GetString(item, EventFields.Location),

            StartTime = GetString(item, EventFields.StartTime),

            EndTime = GetString(item, EventFields.EndTime),

            Status = GetString(item, EventFields.Status),

            BannerUrl = GetString(item, EventFields.BannerUrl),

            Category = GetString(item, EventFields.Category),

            SpeakerName = GetString(item, EventFields.SpeakerName),

            Prerequisites = GetString(item, EventFields.Prerequisites),

            RequiredTools = GetString(item, EventFields.RequiredTools),

            MaxSlots = GetInt(item, EventFields.MaxSlots),

            RegisteredCount = GetInt(item, EventFields.RegisteredCount),

            IsVisible = GetBool(item, EventFields.IsVisible, defaultValue: true),

            CategoryId = GetString(item, EventFields.CategoryId)
        };
    }

    private static string GetString(
        Dictionary<string, AttributeValue> item,
        string key)
    {
        return item.TryGetValue(key, out var value)
            ? value.S ?? string.Empty
            : string.Empty;
    }

    private static int GetInt(
        Dictionary<string, AttributeValue> item,
        string key)
    {
        return item.TryGetValue(key, out var value)
               && int.TryParse(value.N, out var number)
            ? number
            : 0;
    }

    private static bool GetBool(
        Dictionary<string, AttributeValue> item,
        string key,
        bool defaultValue)
    {
        return item.TryGetValue(key, out var value) && value.BOOL.HasValue
            ? value.BOOL.Value
            : defaultValue;
    }
}