using System.Net;
using System.Text.Json;
using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.S3;
using EventManagement.Shared.DTOs.Analytics;
using EventManagement.Shared.Repositories;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.AnalyticsLambda;

public class Function
{
    private readonly IAnalyticsRepository _analyticsRepo;
    private readonly IEventRepository _eventRepo;

    public Function()
    {
        var dynamoDb = new AmazonDynamoDBClient();
        var s3Client = new AmazonS3Client();

        var eventTable = Environment.GetEnvironmentVariable("EVENT_TABLE_NAME") ?? "EventManagementEvents";
        var ticketTable = Environment.GetEnvironmentVariable("TICKET_TABLE_NAME") ?? "EventManagementTickets";
        var attendanceTable = Environment.GetEnvironmentVariable("ATTENDANCE_TABLE_NAME") ?? "EventManagementAttendance";
        var notificationLogTable = Environment.GetEnvironmentVariable("NOTIFICATION_LOG_TABLE_NAME") ?? "EventManagementNotificationLog";
        var certificateBucket = Environment.GetEnvironmentVariable("CERTIFICATE_BUCKET_NAME") ?? "";

        _analyticsRepo = new AnalyticsRepository(
            dynamoDb, s3Client, eventTable, ticketTable, attendanceTable, notificationLogTable, certificateBucket);
        _eventRepo = new EventRepository(dynamoDb, eventTable);
    }

    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            if (request.PathParameters != null && request.PathParameters.TryGetValue("eventId", out var eventId))
            {
                return await HandleEventAnalyticsAsync(eventId, context);
            }

            return await HandleDashboardAsync(context);
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"[ERROR] {ex.Message}\n{ex.StackTrace}");
            return CreateResponse(HttpStatusCode.InternalServerError, new { message = "Lỗi hệ thống.", detail = ex.Message });
        }
    }

    private async Task<APIGatewayProxyResponse> HandleDashboardAsync(ILambdaContext context)
    {
        var totalEvents = await _analyticsRepo.CountEventsAsync();
        var (totalReg, confirmedReg, waitingReg) = await _analyticsRepo.GetRegistrationStatsAsync();
        var checkInCount = await _analyticsRepo.CountAttendanceAsync();
        var certificatesIssued = await _analyticsRepo.CountCertificatesIssuedAsync();
        var (emailSent, emailFailed) = await _analyticsRepo.GetNotificationStatsAsync();

        double avgAttendanceRate = confirmedReg > 0
            ? Math.Round((double)checkInCount / confirmedReg * 100, 1)
            : 0;

        var dto = new DashboardOverviewDto
        {
            TotalEvents = totalEvents,
            TotalRegistrations = totalReg,
            ConfirmedRegistrations = confirmedReg,
            WaitingRegistrations = waitingReg,
            TotalCheckIns = checkInCount,
            AverageAttendanceRate = avgAttendanceRate,
            EmailSentCount = emailSent,
            EmailFailedCount = emailFailed,
            CertificatesIssuedCount = certificatesIssued
        };

        return CreateResponse(HttpStatusCode.OK, dto);
    }

    private async Task<APIGatewayProxyResponse> HandleEventAnalyticsAsync(string eventId, ILambdaContext context)
    {
        var evt = await _eventRepo.GetByIdAsync(eventId);
        if (evt == null)
        {
            return CreateResponse(HttpStatusCode.NotFound, new { message = "Sự kiện không tồn tại.", eventId });
        }

        var dto = await _analyticsRepo.GetEventAnalyticsAsync(eventId, evt.Title);
        return CreateResponse(HttpStatusCode.OK, dto);
    }

    private APIGatewayProxyResponse CreateResponse(HttpStatusCode statusCode, object body)
    {
        return new APIGatewayProxyResponse
        {
            StatusCode = (int)statusCode,
            Body = JsonSerializer.Serialize(body, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            }),
            Headers = new Dictionary<string, string>
            {
                ["Content-Type"] = "application/json",
                ["Access-Control-Allow-Origin"] = "*",
                ["Access-Control-Allow-Headers"] = "Content-Type,Authorization",
                ["Access-Control-Allow-Methods"] = "GET,OPTIONS"
            }
        };
    }
}