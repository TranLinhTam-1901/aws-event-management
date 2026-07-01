using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Categories;

namespace EventManagement.Shared.Mappers;

public static class CategoryDynamoMapper
{
    public static Dictionary<string, AttributeValue> ToDynamoItem(CategoryResponseDto item)
    {
        return new Dictionary<string, AttributeValue>
        {
            [CategoryFields.CategoryId] = new AttributeValue { S = item.CategoryId },
            [CategoryFields.Name] = new AttributeValue { S = item.Name },
            [CategoryFields.IsActive] = new AttributeValue { BOOL = item.IsActive },
            [CategoryFields.SortOrder] = new AttributeValue { N = item.SortOrder.ToString() },
            [CategoryFields.CreatedAt] = new AttributeValue { S = item.CreatedAt }
        };
    }

    public static CategoryResponseDto FromDynamoItem(Dictionary<string, AttributeValue> item)
    {
        return new CategoryResponseDto
        {
            CategoryId = GetString(item, CategoryFields.CategoryId),
            Name = GetString(item, CategoryFields.Name),
            IsActive = GetBool(item, CategoryFields.IsActive, true),
            SortOrder = GetInt(item, CategoryFields.SortOrder),
            CreatedAt = GetString(item, CategoryFields.CreatedAt)
        };
    }

    private static string GetString(Dictionary<string, AttributeValue> item, string key) =>
        item.TryGetValue(key, out var value) ? value.S ?? string.Empty : string.Empty;

    private static int GetInt(Dictionary<string, AttributeValue> item, string key) =>
        item.TryGetValue(key, out var value) && int.TryParse(value.N, out var number) ? number : 0;

    private static bool GetBool(Dictionary<string, AttributeValue> item, string key, bool defaultValue) =>
        item.TryGetValue(key, out var value) && value.BOOL.HasValue ? value.BOOL.Value : defaultValue;
}
