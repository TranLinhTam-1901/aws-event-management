using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using EventManagement.Shared.DTOs.Registrations;
using EventManagement.Shared.Repositories;
using EventManagement.Shared.Services;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.RegistrationTicketLambda;

public class Function
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private static readonly JsonSerializerOptions DeserializeOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly IRegistrationService _registrationService;

    public Function()
    {
        var dynamoDb = new AmazonDynamoDBClient();

        var eventTableName =
            Environment.GetEnvironmentVariable("EVENT_TABLE_NAME")
            ?? "EventManagementEvents";

        var ticketTableName =
            Environment.GetEnvironmentVariable("TICKET_TABLE_NAME")
            ?? "EventManagementTickets";

        var eventRepository = new EventRepository(dynamoDb, eventTableName);
        var ticketRepository = new TicketRepository(dynamoDb, ticketTableName);
        _registrationService = new RegistrationService(eventRepository, ticketRepository);
    }

    public async Task<APIGatewayProxyResponse> FunctionHandler(
        APIGatewayProxyRequest request,
        ILambdaContext context)
    {
        try
        {
            var userId = ExtractUserId(request, context);

            if (string.IsNullOrEmpty(userId))
            {
                return JsonResponse(HttpStatusCode.Unauthorized, new { message = "Unauthorized" });
            }

            if (request.HttpMethod == "POST" &&
                request.Path.Contains("/register"))
            {
                var eventId = ExtractEventId(request);

                if (string.IsNullOrWhiteSpace(eventId))
                {
                    return JsonResponse(HttpStatusCode.BadRequest, new { message = "Event ID is required." });
                }

                var requestBody = JsonSerializer.Deserialize<RegisterEventRequestDto>(
                    request.Body,
                    DeserializeOptions);

                if (requestBody == null)
                {
                    return JsonResponse(HttpStatusCode.BadRequest, new { message = "Invalid request body." });
                }

                var result = await _registrationService.RegisterForEventAsync(
                    eventId,
                    userId,
                    requestBody);

                return JsonResponse(HttpStatusCode.Created, result);
            }

            if (request.HttpMethod == "GET" &&
                request.Path == "/my-tickets")
            {
                var tickets = await _registrationService.GetMyTicketsAsync(userId);
                return JsonResponse(HttpStatusCode.OK, tickets);
            }

            return JsonResponse(HttpStatusCode.NotFound, new { message = "Route not found" });
        }
        catch (EventFullException ex)
        {
            return JsonResponse(HttpStatusCode.Conflict, new { message = ex.Message });
        }
        catch (AlreadyRegisteredException ex)
        {
            return JsonResponse(HttpStatusCode.Conflict, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            context.Logger.LogError(ex.ToString());
            return JsonResponse(HttpStatusCode.BadRequest, new { message = ex.Message });
        }
    }

    private static string? ExtractEventId(APIGatewayProxyRequest request)
    {
        if (request.PathParameters != null &&
            request.PathParameters.TryGetValue("eventId", out var eventId) &&
            !string.IsNullOrWhiteSpace(eventId))
        {
            return eventId;
        }

        var segments = request.Path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var eventsIndex = Array.FindIndex(segments, s => s.Equals("events", StringComparison.OrdinalIgnoreCase));

        if (eventsIndex >= 0 && eventsIndex + 1 < segments.Length)
        {
            return segments[eventsIndex + 1];
        }

        return segments.Length >= 2 ? segments[1] : null;
    }

    private static string? ExtractUserId(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            if (request.RequestContext?.Authorizer?.Claims == null)
            {
                return null;
            }

            request.RequestContext.Authorizer.Claims.TryGetValue("sub", out var userId);
            return userId;
        }
        catch (Exception ex)
        {
            context.Logger.LogError(ex.ToString());
            return null;
        }
    }

    private static APIGatewayProxyResponse JsonResponse(HttpStatusCode statusCode, object body)
    {
        return new APIGatewayProxyResponse
        {
            StatusCode = (int)statusCode,
            Body = JsonSerializer.Serialize(body, JsonOptions),
            Headers = new Dictionary<string, string>
            {
                { "Content-Type", "application/json" },
                { "Access-Control-Allow-Origin", "*" }
            }
        };
    }
}
