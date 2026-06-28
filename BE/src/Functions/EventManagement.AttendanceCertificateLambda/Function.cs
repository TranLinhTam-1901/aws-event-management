using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.S3;
using Amazon.S3.Model;
using EventManagement.Shared.DTOs.Attendance;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Net;
using System.Text.Json;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.AttendanceCertificateLambda;

public class Function
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly IAmazonS3 _s3Client;
    private readonly string _certificateBucketName;
    private readonly string _ticketTableName;
    private readonly string _attendanceTableName;

    public Function()
    {
        _ticketTableName = Environment.GetEnvironmentVariable("TICKET_TABLE_NAME") ?? "EventManagementTickets";
        _attendanceTableName = Environment.GetEnvironmentVariable("ATTENDANCE_TABLE_NAME") ?? "EventManagementAttendance";
        _certificateBucketName = Environment.GetEnvironmentVariable("CERTIFICATE_BUCKET_NAME") ?? "event-management-certificates";

        _dynamoDb = new AmazonDynamoDBClient();
        _s3Client = new AmazonS3Client();

        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<APIGatewayProxyResponse> FunctionHandler(
        APIGatewayProxyRequest request,
        ILambdaContext context)
    {
        context.Logger.LogLine($"[REQUEST] {request.HttpMethod} {request.Path}, Resource={request.Resource}");

        try
        {
            var path = request.Path?.TrimEnd('/');
            var httpMethod = request.HttpMethod?.ToUpperInvariant();

            if (httpMethod == "OPTIONS")
            {
                return CreateResponse(HttpStatusCode.OK, new { message = "CORS OK" });
            }

            var userClaims = ExtractJwtClaims(request, context);

            if (httpMethod == "GET"
                && path != null
                && (path.StartsWith("/certificates/")
                    || path.StartsWith("/certificates-v2/")))
            {
                var ticketId = path.Split('/').Last();
                return await HandleGenerateCertificateAsync(ticketId, context);
            }

            if (httpMethod == "POST" && path != null && path.EndsWith("/tickets/checkin"))
            {
                if (userClaims == null)
                {
                    return CreateResponse(HttpStatusCode.Unauthorized, new
                    {
                        success = false,
                        message = "Yêu cầu không hợp lệ. Vui lòng đăng nhập lại!"
                    });
                }

                if (!userClaims.IsAdmin)
                {
                    return CreateResponse(HttpStatusCode.Forbidden, new
                    {
                        success = false,
                        message = "Bạn không có quyền check-in. Chỉ Admin được phép thực hiện."
                    });
                }

                return await HandleCheckInAsync(request, context);
            }

            return CreateResponse(HttpStatusCode.NotFound, new
            {
                success = false,
                message = $"API {request.HttpMethod} {request.Path} không tồn tại.",
                path,
                resource = request.Resource
            });
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"[ERROR] {ex.Message}\n{ex.StackTrace}");

            return CreateResponse(HttpStatusCode.InternalServerError, new
            {
                success = false,
                message = "Lỗi hệ thống.",
                detail = ex.Message
            });
        }
    }

    private async Task<APIGatewayProxyResponse> HandleCheckInAsync(
        APIGatewayProxyRequest request,
        ILambdaContext context)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
        {
            return CreateResponse(HttpStatusCode.BadRequest, new
            {
                success = false,
                message = "Thiếu body request."
            });
        }

        var dto = JsonSerializer.Deserialize<CheckInRequestDto>(
            request.Body,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (dto == null || string.IsNullOrWhiteSpace(dto.TicketId))
        {
            return CreateResponse(HttpStatusCode.BadRequest, new
            {
                success = false,
                message = "Thiếu ticketId."
            });
        }

        var ticketId = dto.TicketId.Trim();

        var checkInMethod = string.IsNullOrWhiteSpace(dto.Method)
            ? "QR"
            : dto.Method.Trim().ToUpperInvariant();

        if (checkInMethod != "QR" && checkInMethod != "MANUAL")
        {
            checkInMethod = "QR";
        }

        context.Logger.LogLine($"[CHECK-IN] TicketId: {ticketId}, Method: {checkInMethod}");

        var ticket = await GetTicketByIdAsync(ticketId);

        if (ticket == null)
        {
            return CreateResponse(HttpStatusCode.NotFound, new
            {
                success = false,
                message = "Vé không tồn tại.",
                ticketId
            });
        }

        var status = GetString(ticket, "Status");

        if (status != "CONFIRMED" && status != "SUCCESS")
        {
            return CreateResponse(HttpStatusCode.BadRequest, new
            {
                success = false,
                message = "Vé không hợp lệ để check-in.",
                ticketId,
                status
            });
        }

        var eventId = GetString(ticket, "EventId");
        var userId = GetString(ticket, "UserId");
        var userEmail = GetString(ticket, "UserEmail");
        var userFullName = GetString(ticket, "UserFullName");
        var eventTitle = GetString(ticket, "EventTitle");

        var existed = await IsAlreadyCheckedInAsync(eventId, ticketId);

        if (existed)
        {
            return CreateResponse(HttpStatusCode.Conflict, new
            {
                success = false,
                message = "Vé đã được check-in trước đó.",
                ticketId,
                eventId,
                eventTitle,
                userId,
                userEmail,
                userFullName
            });
        }

        var checkInAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

        await SaveAttendanceAsync(
            eventId,
            ticketId,
            userId,
            userEmail,
            userFullName,
            eventTitle,
            checkInAt,
            checkInMethod
        );

        return CreateResponse(HttpStatusCode.OK, new
        {
            success = true,
            message = "Check-in thành công.",
            ticketId,
            eventId,
            eventTitle,
            userId,
            userEmail,
            userFullName,
            checkInAt,
            checkInMethod
        });
    }

    private async Task<APIGatewayProxyResponse> HandleGenerateCertificateAsync(
        string ticketId,
        ILambdaContext context)
    {
        if (string.IsNullOrWhiteSpace(ticketId))
        {
            return CreateResponse(HttpStatusCode.BadRequest, new
            {
                success = false,
                message = "Thiếu ticketId."
            });
        }

        ticketId = ticketId.Trim();

        var ticket = await GetTicketByIdAsync(ticketId);

        if (ticket == null)
        {
            return CreateResponse(HttpStatusCode.NotFound, new
            {
                success = false,
                message = "Vé không tồn tại.",
                ticketId
            });
        }

        var userFullName = GetString(ticket, "UserFullName");
        var eventTitle = GetString(ticket, "EventTitle");
        var eventLocation = GetString(ticket, "EventLocation");

        if (string.IsNullOrWhiteSpace(userFullName))
            userFullName = "Participant";

        if (string.IsNullOrWhiteSpace(eventTitle))
            eventTitle = "AWS Event Management Workshop";

        if (string.IsNullOrWhiteSpace(eventLocation))
            eventLocation = "HUTECH";

        var certificateId = $"CERT-{ticketId[..Math.Min(8, ticketId.Length)].ToUpperInvariant()}";
        var issuedAt = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var s3Key = $"certificates/{ticketId}.pdf";

        var pdfBytes = GenerateCertificatePdf(
            certificateId,
            userFullName,
            eventTitle,
            eventLocation,
            issuedAt,
            ticketId
        );

        await _s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _certificateBucketName,
            Key = s3Key,
            InputStream = new MemoryStream(pdfBytes),
            ContentType = "application/pdf"
        });

        var presignedUrl = _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _certificateBucketName,
            Key = s3Key,
            Expires = DateTime.UtcNow.AddMinutes(15)
        });

        context.Logger.LogLine($"[CERTIFICATE] Generated certificate for TicketId={ticketId}, Key={s3Key}");

        return CreateResponse(HttpStatusCode.OK, new
        {
            success = true,
            message = "Tạo certificate thành công.",
            ticketId,
            certificateId,
            downloadUrl = presignedUrl
        });
    }

    private static byte[] GenerateCertificatePdf(
        string certificateId,
        string userFullName,
        string eventTitle,
        string eventLocation,
        string issuedAt,
        string ticketId)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(16));

                page.Content()
                    .Border(3)
                    .BorderColor(Colors.Blue.Medium)
                    .Padding(35)
                    .Column(column =>
                    {
                        column.Spacing(18);

                        column.Item().AlignCenter().Text("AWS Event Management Platform")
                            .FontSize(22)
                            .Bold()
                            .FontColor(Colors.Blue.Darken3);

                        column.Item().AlignCenter().Text("CERTIFICATE OF ATTENDANCE")
                            .FontSize(36)
                            .Bold()
                            .FontColor(Colors.Blue.Darken4);

                        column.Item().AlignCenter().Text("This certifies that")
                            .FontSize(18);

                        column.Item().AlignCenter().Text(userFullName.ToUpperInvariant())
                            .FontSize(34)
                            .Bold()
                            .FontColor(Colors.Black);

                        column.Item().AlignCenter().Text("has successfully participated in")
                            .FontSize(18);

                        column.Item().AlignCenter().Text(eventTitle)
                            .FontSize(28)
                            .Bold()
                            .FontColor(Colors.Blue.Darken2);

                        column.Item().AlignCenter().Text($"Location: {eventLocation}")
                            .FontSize(18);

                        column.Item().PaddingTop(20).Row(row =>
                        {
                            row.RelativeItem().Column(left =>
                            {
                                left.Item().Text($"Certificate ID: {certificateId}")
                                    .FontSize(14);

                                left.Item().Text($"Ticket ID: {ticketId}")
                                    .FontSize(12);

                                left.Item().Text($"Issued Date: {issuedAt}")
                                    .FontSize(14);
                            });

                            row.RelativeItem().AlignRight().Column(right =>
                            {
                                right.Item().AlignCenter().Text("Authorized Signature")
                                    .FontSize(14);

                                right.Item().PaddingTop(20).Width(180).LineHorizontal(1);

                                right.Item().AlignCenter().Text("Event Organizer")
                                    .FontSize(14);
                            });
                        });

                        column.Item().PaddingTop(10).AlignCenter().Text("Issued by AWS Event Management Platform")
                            .FontSize(13)
                            .FontColor(Colors.Grey.Darken2);
                    });
            });
        }).GeneratePdf();
    }

    private async Task<Dictionary<string, AttributeValue>?> GetTicketByIdAsync(string ticketId)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _ticketTableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["TicketId"] = new AttributeValue { S = ticketId }
            }
        });

        if (response.Item == null || response.Item.Count == 0)
        {
            return null;
        }

        return response.Item;
    }

    private async Task<bool> IsAlreadyCheckedInAsync(string eventId, string ticketId)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _attendanceTableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["EventId"] = new AttributeValue { S = eventId },
                ["TicketId"] = new AttributeValue { S = ticketId }
            }
        });

        return response.Item != null && response.Item.Count > 0;
    }

    private async Task SaveAttendanceAsync(
        string eventId,
        string ticketId,
        string userId,
        string userEmail,
        string userFullName,
        string eventTitle,
        string checkInAt,
        string checkInMethod)
    {
        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _attendanceTableName,
            Item = new Dictionary<string, AttributeValue>
            {
                ["EventId"] = new AttributeValue { S = eventId },
                ["TicketId"] = new AttributeValue { S = ticketId },
                ["UserId"] = new AttributeValue { S = userId },
                ["UserEmail"] = new AttributeValue { S = userEmail },
                ["UserFullName"] = new AttributeValue { S = userFullName },
                ["EventTitle"] = new AttributeValue { S = eventTitle },
                ["Status"] = new AttributeValue { S = "ATTENDED" },
                ["CheckInMethod"] = new AttributeValue { S = checkInMethod },
                ["CheckInAt"] = new AttributeValue { S = checkInAt },
                ["CreatedAt"] = new AttributeValue { S = checkInAt }
            },
            ConditionExpression = "attribute_not_exists(EventId) AND attribute_not_exists(TicketId)"
        });
    }

    private JwtClaims? ExtractJwtClaims(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            bool isLocal = Environment.GetEnvironmentVariable("AWS_SAM_LOCAL") == "true";

            if (request.RequestContext?.Authorizer?.Claims == null)
            {
                if (isLocal)
                {
                    return new JwtClaims
                    {
                        UserId = "admin-test",
                        Email = "admin@test.com",
                        FullName = "Administrator",
                        Groups = new List<string> { "Admin" }
                    };
                }

                return null;
            }

            var claims = request.RequestContext.Authorizer.Claims;

            claims.TryGetValue("sub", out var userId);
            claims.TryGetValue("email", out var email);
            claims.TryGetValue("name", out var fullName);

            var groups = new List<string>();

            if (claims.TryGetValue("cognito:groups", out var groupsObj) && groupsObj != null)
            {
                var groupsStr = groupsObj.ToString() ?? string.Empty;

                groups = groupsStr.StartsWith("[") && groupsStr.EndsWith("]")
                    ? JsonSerializer.Deserialize<List<string>>(groupsStr) ?? new List<string>()
                    : groupsStr.Split(',').Select(g => g.Trim()).ToList();
            }

            if (string.IsNullOrEmpty(userId))
            {
                return null;
            }

            return new JwtClaims
            {
                UserId = userId,
                Email = email ?? string.Empty,
                FullName = fullName ?? string.Empty,
                Groups = groups
            };
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"Error extracting JWT claims: {ex.Message}");
            return null;
        }
    }

    private static string GetString(Dictionary<string, AttributeValue> item, string key)
    {
        if (item.TryGetValue(key, out var value))
        {
            return value.S ?? string.Empty;
        }

        var camelKey = char.ToLowerInvariant(key[0]) + key.Substring(1);

        if (item.TryGetValue(camelKey, out var camelValue))
        {
            return camelValue.S ?? string.Empty;
        }

        return string.Empty;
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
                ["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
            }
        };
    }
}

public class JwtClaims
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public List<string> Groups { get; set; } = new();

    public bool IsAdmin => Groups.Contains("Admin");
}