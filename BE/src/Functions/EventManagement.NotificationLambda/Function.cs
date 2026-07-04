using System.Text.Json;
using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.SimpleEmail;
using EventManagement.Shared.DTOs.Notifications;
using EventManagement.Shared.Repositories;
using EventManagement.Shared.Services;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.NotificationLambda;

public class Function
{
    private readonly INotificationRepository _notificationRepo;
    private readonly ISesEmailService _emailService;

    public Function()
    {
        var dynamoDb = new AmazonDynamoDBClient();
        var sesClient = new AmazonSimpleEmailServiceClient();

        var notificationLogTable = Environment.GetEnvironmentVariable("NOTIFICATION_LOG_TABLE_NAME")!;
        var eventTable = Environment.GetEnvironmentVariable("EVENT_TABLE_NAME")!;
        var ticketTable = Environment.GetEnvironmentVariable("TICKET_TABLE_NAME")!;
        var fromEmail = Environment.GetEnvironmentVariable("SES_FROM_EMAIL")!;

        _notificationRepo = new NotificationRepository(dynamoDb, notificationLogTable, eventTable, ticketTable);
        _emailService = new SesEmailService(sesClient, fromEmail);
    }

    // Constructor cho Unit Test (Dependency Injection thủ công)
    public Function(INotificationRepository notificationRepo, ISesEmailService emailService)
    {
        _notificationRepo = notificationRepo;
        _emailService = emailService;
    }

    public async Task<APIGatewayProxyResponse?> FunctionHandler(JsonElement input, ILambdaContext context)
    {
        // --- Phân loại event dựa trên cấu trúc JSON ---

        // 1. API Gateway request: luôn có field "httpMethod"
        if (input.TryGetProperty("httpMethod", out _))
        {
            return await HandleApiRequestAsync(input, context);
        }

        // 2. EventBridge event (cả custom event lẫn Schedule) đều có "detail-type"
        if (input.TryGetProperty("detail-type", out var detailTypeProp))
        {
            var detailType = detailTypeProp.GetString();

            if (detailType == "Scheduled Event")
            {
                await HandleReminderScheduleAsync(context);
                return null;
            }

            if (detailType == "TicketRegistered")
            {
                await HandleTicketRegisteredAsync(input, context);
                return null;
            }

            context.Logger.LogWarning($"Unrecognized detail-type: {detailType}");
            return null;
        }

        context.Logger.LogWarning("Unrecognized event shape, ignoring.");
        return null;
    }

    // ==========================================================
    // 1. API Gateway: GET /admin/notifications
    // ==========================================================
    private async Task<APIGatewayProxyResponse> HandleApiRequestAsync(JsonElement input, ILambdaContext context)
    {
        try
        {
            var logs = await _notificationRepo.GetAllLogsAsync();
            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = new Dictionary<string, string> { ["Content-Type"] = "application/json" },
                Body = JsonSerializer.Serialize(logs)
            };
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"HandleApiRequestAsync error: {ex.Message}");
            return new APIGatewayProxyResponse
            {
                StatusCode = 500,
                Body = JsonSerializer.Serialize(new { error = "Internal server error" })
            };
        }
    }

    // ==========================================================
    // 2. EventBridge custom event: TicketRegistered -> gửi email xác nhận / waiting list
    // ==========================================================
    private async Task HandleTicketRegisteredAsync(JsonElement input, ILambdaContext context)
    {
        if (!input.TryGetProperty("detail", out var detailElement))
        {
            context.Logger.LogWarning("TicketRegistered event missing 'detail' field.");
            return;
        }

        var eventDto = detailElement.Deserialize<NotificationEventDto>(
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (eventDto == null || string.IsNullOrEmpty(eventDto.Email))
        {
            context.Logger.LogWarning("TicketRegistered payload invalid or missing Email.");
            return;
        }

        // eventDto.Type kỳ vọng là "RegistrationConfirmed" hoặc "WaitingList" (do TicketFunction set khi PutEvents)
        var (subject, body) = eventDto.Type switch
        {
            "WaitingList" => EmailTemplateBuilder.BuildWaitingList(
                eventDto.FullName,
                eventDto.Data.GetValueOrDefault("EventTitle", "")),

            _ => EmailTemplateBuilder.BuildRegistrationConfirmed(
                eventDto.FullName,
                eventDto.Data.GetValueOrDefault("EventTitle", ""),
                eventDto.Data.GetValueOrDefault("StartTime", ""),
                eventDto.Data.GetValueOrDefault("Location", ""))
        };

        var (success, errorMessage) = await _emailService.SendEmailAsync(eventDto.Email, subject, body);

        await _notificationRepo.LogNotificationAsync(new NotificationLogDto
        {
            NotificationId = Guid.NewGuid().ToString(),
            EventId = eventDto.EventId,
            Email = eventDto.Email,
            Type = eventDto.Type,
            Status = success ? "Sent" : "Failed",
            ErrorMessage = success ? null : errorMessage,
            SentAt = DateTime.UtcNow
        });

        if (!success)
        {
            context.Logger.LogError($"Send email failed for {eventDto.Email}: {errorMessage}");
        }
    }

    // ==========================================================
    // 3. Schedule (rate 1 hour): quét sự kiện sắp diễn ra trong 24h tới, gửi email nhắc
    // ==========================================================
    private async Task HandleReminderScheduleAsync(ILambdaContext context)
    {
        var now = DateTime.UtcNow;
        var upcomingEvents = await _notificationRepo.GetUpcomingEventsAsync(now, now.AddHours(24));

        context.Logger.LogInformation($"Found {upcomingEvents.Count} upcoming event(s) for reminder.");

        foreach (var evt in upcomingEvents)
        {
            var tickets = await _notificationRepo.GetConfirmedTicketsByEventIdAsync(evt.EventId);

            foreach (var ticket in tickets)
            {
                var (subject, body) = EmailTemplateBuilder.BuildEventReminder(
                    ticket.UserFullName, evt.Title, evt.StartTime, evt.Location);

                var (success, errorMessage) = await _emailService.SendEmailAsync(
                    ticket.UserEmail, subject, body);

                await _notificationRepo.LogNotificationAsync(new NotificationLogDto
                {
                    NotificationId = Guid.NewGuid().ToString(),
                    EventId = evt.EventId,
                    Email = ticket.UserEmail,
                    Type = "EventReminder",
                    Status = success ? "Sent" : "Failed",
                    ErrorMessage = success ? null : errorMessage,
                    SentAt = DateTime.UtcNow
                });
            }
        }
    }
}