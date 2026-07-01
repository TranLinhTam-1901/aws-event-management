using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using EventManagement.EventLambda.Routes;
using Amazon.DynamoDBv2;
using Amazon.S3;
using EventManagement.Shared.Repositories;
using EventManagement.Shared.Services;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.EventLambda;

public class Function
{
    private readonly EventRouteHandler _routeHandler;

    public Function()
    {
        var dynamoDb = new AmazonDynamoDBClient();
        var s3Client = new AmazonS3Client();

        var eventTableName =
            Environment.GetEnvironmentVariable("EVENT_TABLE_NAME")
            ?? "EventTable";

        var categoryTableName =
            Environment.GetEnvironmentVariable("CATEGORY_TABLE_NAME")
            ?? "EventManagementCategories";

        var bannerBucketName =
            Environment.GetEnvironmentVariable("BANNER_BUCKET_NAME")
            ?? string.Empty;

        var eventRepository = new EventRepository(dynamoDb, eventTableName);
        var categoryRepository = new CategoryRepository(dynamoDb, categoryTableName);
        var categoryService = new CategoryService(categoryRepository);
        var eventService = new EventService(
            eventRepository,
            s3Client,
            bannerBucketName,
            categoryService);

        _routeHandler = new EventRouteHandler(eventService, categoryService);
    }

    public async Task<APIGatewayProxyResponse> FunctionHandler(
        APIGatewayProxyRequest request,
        ILambdaContext context)
    {
        return await _routeHandler.HandleAsync(request, context);
    }
}
