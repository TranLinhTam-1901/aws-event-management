using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Net;
using System.Text.Json;

namespace EventManagement.EventLambda.Routes;

public class EventRouteHandler
{
    public async Task<APIGatewayProxyResponse> HandleAsync(
        APIGatewayProxyRequest request,
        ILambdaContext context)
    {
        if (request.HttpMethod == "GET" && request.Path == "/events")
        {
            var events = new[]
            {
                new
                {
                    eventId = "1",
                    title = "AWS Workshop Demo",
                    location = "Ho Chi Minh City"
                }
            };

            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                Body = JsonSerializer.Serialize(events),
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" },
                    { "Access-Control-Allow-Origin", "*" }
                }
            };
        }

        return new APIGatewayProxyResponse
        {
            StatusCode = (int)HttpStatusCode.NotFound,
            Body = "Route not found",
            Headers = new Dictionary<string, string>
            {
                { "Access-Control-Allow-Origin", "*" }
            }
        };
    }
}