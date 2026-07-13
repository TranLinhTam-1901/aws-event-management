using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using EventManagement.Shared.Services;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using EventManagement.Shared.DTOs.Events;
using EventManagement.Shared.DTOs.Categories;

namespace EventManagement.EventLambda.Routes;

public class EventRouteHandler
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private static readonly JsonSerializerOptions DeserializeOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly IEventService _eventService;
    private readonly ICategoryService _categoryService;

    public EventRouteHandler(
        IEventService eventService,
        ICategoryService categoryService)
    {
        _eventService = eventService;
        _categoryService = categoryService;
    }

    public async Task<APIGatewayProxyResponse> HandleAsync(
        APIGatewayProxyRequest request,
        ILambdaContext context)
    {
        try
        {
            if (request.HttpMethod == "GET" &&
                request.Path == "/events")
            {
                var events = await _eventService.GetPublicEventsAsync();

                return JsonResponse(HttpStatusCode.OK, events);
            }

            if (request.HttpMethod == "GET" &&
                request.Path == "/admin/events")
            {
                var events = await _eventService.GetAdminEventsAsync();

                return JsonResponse(HttpStatusCode.OK, events);
            }

            if (request.HttpMethod == "GET" &&
                request.Path == "/admin/events/banner-upload-url")
            {
                var contentType = request.QueryStringParameters != null &&
                    request.QueryStringParameters.TryGetValue("contentType", out var ct)
                    ? ct
                    : "image/png";

                var eventId = request.QueryStringParameters != null &&
                    request.QueryStringParameters.TryGetValue("eventId", out var id)
                    ? id
                    : null;

                var uploadInfo =
                    await _eventService.GenerateBannerUploadUrlAsync(eventId, contentType);

                return JsonResponse(HttpStatusCode.OK, uploadInfo);
            }

            if (request.HttpMethod == "GET" &&
                request.Path == "/categories")
            {
                var categories = await _categoryService.GetPublicCategoriesAsync();
                return JsonResponse(HttpStatusCode.OK, categories);
            }

            if (request.HttpMethod == "GET" &&
                request.Path == "/admin/categories")
            {
                var categories = await _categoryService.GetAdminCategoriesAsync();
                return JsonResponse(HttpStatusCode.OK, categories);
            }

            if (request.HttpMethod == "POST" &&
                request.Path == "/admin/categories")
            {
                var requestBody = JsonSerializer.Deserialize<CategoryCreateRequestDto>(
                    request.Body,
                    DeserializeOptions);

                if (requestBody == null)
                {
                    throw new Exception("Invalid request body.");
                }

                var created = await _categoryService.CreateCategoryAsync(requestBody);
                return JsonResponse(HttpStatusCode.Created, created);
            }

            if ((request.HttpMethod == "PUT" || request.HttpMethod == "PATCH") &&
                request.Path.StartsWith("/admin/categories/"))
            {
                var categoryId = request.Path.Split('/').Last();
                var requestBody = JsonSerializer.Deserialize<CategoryUpdateRequestDto>(
                    request.Body,
                    DeserializeOptions);

                if (requestBody == null)
                {
                    throw new Exception("Invalid request body.");
                }

                var updated = await _categoryService.UpdateCategoryAsync(categoryId, requestBody);
                return JsonResponse(HttpStatusCode.OK, updated);
            }

            if (request.HttpMethod == "DELETE" &&
                request.Path.StartsWith("/admin/categories/"))
            {
                var categoryId = request.Path.Split('/').Last();
                await _categoryService.DeactivateCategoryAsync(categoryId);
                return JsonResponse(HttpStatusCode.OK, new { message = "Category deactivated." });
            }

            if (request.HttpMethod == "POST" &&
                request.Path == "/admin/events")
            {
                var requestBody =
                    JsonSerializer.Deserialize<EventCreateRequestDto>(request.Body, DeserializeOptions);

                if (requestBody == null)
                {
                    throw new Exception("Invalid request body.");
                }

                var createdEvent =
                    await _eventService.CreateEventAsync(requestBody);

                return JsonResponse(HttpStatusCode.Created, createdEvent);
            }

            if (request.HttpMethod == "GET" &&
                request.Path.StartsWith("/admin/events/") &&
                !request.Path.EndsWith("/visibility"))
            {
                var eventId = request.Path.Split('/').Last();

                var eventData =
                    await _eventService.GetAdminEventByIdAsync(eventId);

                if (eventData == null)
                {
                    return JsonResponse(
                        HttpStatusCode.NotFound,
                        new { message = "Event not found" });
                }

                return JsonResponse(HttpStatusCode.OK, eventData);
            }

            if (request.HttpMethod == "GET" &&
                request.Path.StartsWith("/events/"))
            {
                var eventId = request.Path.Split('/').Last();

                var eventData =
                    await _eventService.GetPublicEventByIdAsync(eventId);

                if (eventData == null)
                {
                    return JsonResponse(
                        HttpStatusCode.NotFound,
                        new { message = "Event not found" });
                }

                return JsonResponse(HttpStatusCode.OK, eventData);
            }

            if (request.HttpMethod == "PATCH" &&
                request.Path.EndsWith("/visibility"))
            {
                var eventId = request.Path.Split('/')[3];

                var requestBody =
                    JsonSerializer.Deserialize<EventVisibilityRequestDto>(
                        request.Body,
                        DeserializeOptions);

                if (requestBody == null)
                {
                    throw new Exception("Invalid request body.");
                }

                await _eventService.SetEventVisibilityAsync(
                    eventId,
                    requestBody.IsVisible);

                return JsonResponse(
                    HttpStatusCode.OK,
                    new
                    {
                        message = requestBody.IsVisible
                            ? "Event is now visible."
                            : "Event is now hidden.",
                        isVisible = requestBody.IsVisible
                    });
            }

            if (request.HttpMethod == "PUT" &&
                request.Path.StartsWith("/admin/events/"))
            {
                var eventId = request.Path.Split('/').Last();

                var requestBody =
                    JsonSerializer.Deserialize<EventUpdateRequestDto>(request.Body, DeserializeOptions);

                if (requestBody == null)
                {
                    throw new Exception("Invalid request body.");
                }

                var updatedEvent =
                    await _eventService.UpdateEventAsync(eventId, requestBody);

                return JsonResponse(HttpStatusCode.OK, updatedEvent);
            }

            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.NotFound,
                Body = "Route not found",
                Headers = CorsHeaders()
            };
        }
        catch (Exception ex)
        {
            context.Logger.LogError(ex.ToString());

            return JsonResponse(
                HttpStatusCode.InternalServerError,
                new { message = ex.Message });
        }
    }

    private static APIGatewayProxyResponse JsonResponse(
        HttpStatusCode statusCode,
        object body)
    {
        return new APIGatewayProxyResponse
        {
            StatusCode = (int)statusCode,
            Body = JsonSerializer.Serialize(body, JsonOptions),
            Headers = CorsHeaders()
        };
    }

    private static Dictionary<string, string> CorsHeaders()
    {
        return new Dictionary<string, string>
        {
            { "Content-Type", "application/json" },
            { "Access-Control-Allow-Origin", "*" }
        };
    }
}
