using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Categories;
using EventManagement.Shared.Mappers;

namespace EventManagement.Shared.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public CategoryRepository(IAmazonDynamoDB dynamoDb, string tableName)
    {
        _dynamoDb = dynamoDb;
        _tableName = tableName;
    }

    public async Task<List<CategoryResponseDto>> GetAllAsync()
    {
        var response = await _dynamoDb.ScanAsync(new ScanRequest
        {
            TableName = _tableName
        });

        return response.Items
            .Select(CategoryDynamoMapper.FromDynamoItem)
            .OrderBy(c => c.Name)
            .ToList();
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(string categoryId)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [CategoryFields.CategoryId] = new AttributeValue { S = categoryId }
            }
        });

        if (response.Item == null || response.Item.Count == 0)
        {
            return null;
        }

        return CategoryDynamoMapper.FromDynamoItem(response.Item);
    }

    public async Task CreateAsync(CategoryResponseDto category)
    {
        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = CategoryDynamoMapper.ToDynamoItem(category)
        });
    }

    public async Task UpdateAsync(CategoryResponseDto category)
    {
        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = CategoryDynamoMapper.ToDynamoItem(category)
        });
    }
}
