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
using System.Web;
using Amazon.SimpleEmailV2;
using Amazon.SimpleEmailV2.Model;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.AttendanceCertificateLambda;

public class Function
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly IAmazonS3 _s3Client;
    private readonly string _certificateBucketName;
    private readonly string _ticketTableName;
    private readonly string _attendanceTableName;
    private readonly IAmazonSimpleEmailServiceV2 _sesClient;
    private readonly string _sesFromEmail;

    public Function()
    {
        _ticketTableName = Environment.GetEnvironmentVariable("TICKET_TABLE_NAME") ?? "EventManagementTickets";
        _attendanceTableName = Environment.GetEnvironmentVariable("ATTENDANCE_TABLE_NAME") ?? "EventManagementAttendance";
        _certificateBucketName = Environment.GetEnvironmentVariable("CERTIFICATE_BUCKET_NAME") ?? "event-management-certificates";

        _dynamoDb = new AmazonDynamoDBClient();
        _s3Client = new AmazonS3Client();
        _sesClient = new AmazonSimpleEmailServiceV2Client();

        _sesFromEmail =
            Environment.GetEnvironmentVariable("SES_FROM_EMAIL")
            ?? throw new Exception("SES_FROM_EMAIL not configured");

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
                return CreateResponse(HttpStatusCode.OK, new { message = "CORS OK" });

            if (httpMethod == "GET"
                && path != null
                && (path.StartsWith("/certificates/") || path.StartsWith("/certificates-v2/")))
            {
                var ticketId = path.Split('/').Last();
                return await HandleGenerateCertificateAsync(ticketId, context);
            }

            if (httpMethod == "GET" && path != null && path.StartsWith("/tickets/"))
            {
                var ticketId = path.Split('/').Last();
                return await HandleGetTicketByIdAsync(ticketId, context);
            }
            if (httpMethod == "GET"
    && path != null
    && path.StartsWith("/admin/events/")
    && path.EndsWith("/attendees"))
            {
                var eventId = request.PathParameters != null
                    && request.PathParameters.TryGetValue("eventId", out var pathEventId)
                        ? pathEventId
                        : path.Split('/', StringSplitOptions.RemoveEmptyEntries)
                            .SkipWhile(part => part != "events")
                            .Skip(1)
                            .FirstOrDefault();

                return await HandleGetEventAttendeesAsync(eventId, context);
            }
            if (httpMethod == "POST" && path != null && path.EndsWith("/tickets/checkin"))
                return await HandleCheckInAsync(request, context);

            return CreateResponse(HttpStatusCode.NotFound, new
            {
                success = false,
                message = $"API {request.HttpMethod} {request.Path} không tồn tại."
            });
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"[ERROR] {ex.Message}\n{ex.StackTrace}");
            return CreateResponse(HttpStatusCode.InternalServerError, new
            {
                success = false,
                message = "Lỗi hệ thống."
            });
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GET /tickets/{ticketId}
    // ─────────────────────────────────────────────────────────────
    private async Task<APIGatewayProxyResponse> HandleGetTicketByIdAsync(
        string ticketId,
        ILambdaContext context)
    {
        if (string.IsNullOrWhiteSpace(ticketId))
            return CreateResponse(HttpStatusCode.BadRequest, new { success = false, message = "Thiếu ticketId." });

        ticketId = ticketId.Trim();
        var ticket = await GetTicketByIdAsync(ticketId);

        if (ticket == null)
            return CreateResponse(HttpStatusCode.NotFound, new { success = false, message = "Vé không tồn tại.", ticketId });

        return CreateResponse(HttpStatusCode.OK, new
        {
            ticketId,
            eventId       = GetString(ticket, "EventId"),
            userId        = GetString(ticket, "UserId"),
            userEmail     = GetString(ticket, "UserEmail"),
            userFullName  = GetString(ticket, "UserFullName"),
            eventTitle    = GetString(ticket, "EventTitle"),
            eventStartTime = GetString(ticket, "EventStartTime"),
            eventLocation = GetString(ticket, "EventLocation"),
            eventCategory = GetString(ticket, "EventCategory"),
            createdAt     = GetString(ticket, "CreatedAt"),
            status        = GetString(ticket, "Status")
        });
    }

    // ─────────────────────────────────────────────────────────────
    // POST /tickets/checkin
    // ─────────────────────────────────────────────────────────────
    private async Task<APIGatewayProxyResponse> HandleCheckInAsync(
        APIGatewayProxyRequest request,
        ILambdaContext context)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
            return CreateResponse(HttpStatusCode.BadRequest, new { success = false, message = "Thiếu body request." });

        var dto = JsonSerializer.Deserialize<CheckInRequestDto>(
            request.Body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (dto == null || string.IsNullOrWhiteSpace(dto.TicketId))
            return CreateResponse(HttpStatusCode.BadRequest, new { success = false, message = "Thiếu ticketId." });

        var ticketId = dto.TicketId.Trim();
        var checkInMethod = string.IsNullOrWhiteSpace(dto.Method) ? "QR"
            : dto.Method.Trim().ToUpperInvariant() is "QR" or "MANUAL" ? dto.Method.Trim().ToUpperInvariant()
            : "QR";

        context.Logger.LogLine($"[CHECK-IN] TicketId: {ticketId}, Method: {checkInMethod}");

        var ticket = await GetTicketByIdAsync(ticketId);
        if (ticket == null)
            return CreateResponse(HttpStatusCode.NotFound, new { success = false, message = "Vé không tồn tại.", ticketId });

        var status = GetString(ticket, "Status");

        if (status == "CHECKED_IN")
            return CreateResponse(HttpStatusCode.Conflict, new
            {
                success = false,
                message = "Vé này đã được check-in trước đó. Không cần check-in lại.",
                ticketId,
                status
            });

        if (status != "CONFIRMED" && status != "SUCCESS" && status != "PENDING_CHECKIN" && status != "PENDING")
            return CreateResponse(HttpStatusCode.BadRequest, new
            {
                success = false,
                message = "Vé không hợp lệ để check-in.",
                ticketId,
                status
            });

        var eventId      = GetString(ticket, "EventId");
        var userId       = GetString(ticket, "UserId");
        var userEmail    = GetString(ticket, "UserEmail");
        var userFullName = GetString(ticket, "UserFullName");
        var eventTitle   = GetString(ticket, "EventTitle");
        var eventLocation = GetString(ticket, "EventLocation");

        if (string.IsNullOrWhiteSpace(eventId))
            return CreateResponse(HttpStatusCode.BadRequest, new
            {
                success = false,
                message = "Vé thiếu EventId, không thể check-in.",
                ticketId
            });

        var existed = await IsAlreadyCheckedInAsync(eventId, ticketId);
        if (existed)
            return CreateResponse(HttpStatusCode.Conflict, new
            {
                success = false,
                message = "Vé đã được check-in trước đó.",
                ticketId, eventId, eventTitle, userId, userEmail, userFullName
            });

        var checkInAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

        await SaveAttendanceAsync(eventId, ticketId, userId, userEmail, userFullName, eventTitle, checkInAt, checkInMethod);
        await UpdateTicketAfterCheckInAsync(ticketId, checkInAt);

        context.Logger.LogLine($"[CHECK-IN] Attendance saved, ticket updated. Generating certificate...");

        // ── Generate certificate PDF + upload to S3 ──────────────────────
        var (certUrl, emailSent, certMessage) = await GenerateAndEmailCertificateAsync(
            ticketId, userFullName, eventTitle, eventLocation, userEmail, context);

        var responseMessage = "Check-in thành công.";
        if (!string.IsNullOrWhiteSpace(certMessage))
            responseMessage = certMessage;

        return CreateResponse(HttpStatusCode.OK, new
        {
            success        = true,
            message        = responseMessage,
            ticketId,
            eventId,
            eventTitle,
            userId,
            userEmail,
            userFullName,
            checkInAt,
            checkInMethod,
            status         = "CHECKED_IN",
            certificateUrl = certUrl ?? string.Empty,
            emailSent
        });
    }

    // ─────────────────────────────────────────────────────────────
    // GET /certificates-v2/{ticketId}
    // ─────────────────────────────────────────────────────────────
    private async Task<APIGatewayProxyResponse> HandleGenerateCertificateAsync(
        string ticketId,
        ILambdaContext context)
    {
        if (string.IsNullOrWhiteSpace(ticketId))
            return CreateResponse(HttpStatusCode.BadRequest, new { success = false, message = "Thiếu ticketId." });

        ticketId = ticketId.Trim();
        var ticket = await GetTicketByIdAsync(ticketId);

        if (ticket == null)
            return CreateResponse(HttpStatusCode.NotFound, new { success = false, message = "Vé không tồn tại.", ticketId });

        var eventId = GetString(ticket, "EventId");
        var attended = await IsAlreadyCheckedInAsync(eventId, ticketId);

        if (!attended)
            return CreateResponse(HttpStatusCode.BadRequest, new
            {
                success = false,
                message = "Bạn chưa check-in nên chưa thể tải chứng nhận.",
                ticketId
            });

        var userFullName  = GetString(ticket, "UserFullName");
        var eventTitle    = GetString(ticket, "EventTitle");
        var eventLocation = GetString(ticket, "EventLocation");
        var userEmail     = GetString(ticket, "UserEmail");

        if (string.IsNullOrWhiteSpace(userFullName))  userFullName  = "Participant";
        if (string.IsNullOrWhiteSpace(eventTitle))    eventTitle    = "AWS Event Management Workshop";
        if (string.IsNullOrWhiteSpace(eventLocation)) eventLocation = "HUTECH";

        var s3Key = $"certificates/{ticketId}.pdf";
        var certificateId = $"CERT-{ticketId[..Math.Min(8, ticketId.Length)].ToUpperInvariant()}";
        var issuedAt = DateTime.UtcNow.ToString("yyyy-MM-dd");

        var pdfBytes = GenerateCertificatePdf(certificateId, userFullName, eventTitle, eventLocation, issuedAt, ticketId);

        await _s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName  = _certificateBucketName,
            Key         = s3Key,
            InputStream = new MemoryStream(pdfBytes),
            ContentType = "application/pdf"
        });

        var presignedUrl = _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _certificateBucketName,
            Key        = s3Key,
            Expires    = DateTime.UtcNow.AddMinutes(15)
        });

        // Send email — failure must not break the endpoint
        var (emailSent, sesError) = await TrySendCertificateEmailAsync(
            userEmail, userFullName, eventTitle, presignedUrl, context);

        if (!emailSent)
            context.Logger.LogLine($"[CERTIFICATE] SES error (non-fatal): {sesError}");

        context.Logger.LogLine($"[CERTIFICATE] Generated for TicketId={ticketId}, Key={s3Key}, emailSent={emailSent}");

        return CreateResponse(HttpStatusCode.OK, new
        {
            success       = true,
            message       = "Tạo certificate thành công.",
            ticketId,
            certificateId,
            downloadUrl   = presignedUrl,
            emailSent
        });
    }

    // ─────────────────────────────────────────────────────────────
    // Shared: generate PDF, upload, presign URL, send email
    // Returns (presignedUrl?, emailSent, message)
    // ─────────────────────────────────────────────────────────────
    private async Task<(string? CertUrl, bool EmailSent, string Message)> GenerateAndEmailCertificateAsync(
        string ticketId,
        string userFullName,
        string eventTitle,
        string eventLocation,
        string userEmail,
        ILambdaContext context)
    {
        if (string.IsNullOrWhiteSpace(userFullName))  userFullName  = "Participant";
        if (string.IsNullOrWhiteSpace(eventTitle))    eventTitle    = "AWS Event Management Workshop";
        if (string.IsNullOrWhiteSpace(eventLocation)) eventLocation = "HUTECH";

        var s3Key         = $"certificates/{ticketId}.pdf";
        var certificateId = $"CERT-{ticketId[..Math.Min(8, ticketId.Length)].ToUpperInvariant()}";
        var issuedAt      = DateTime.UtcNow.ToString("yyyy-MM-dd");

        try
        {
            // Skip re-generation if PDF already exists (idempotent)
            var alreadyExists = await CertificateExistsOnS3Async(s3Key, context);
            if (!alreadyExists)
            {
                var pdfBytes = GenerateCertificatePdf(certificateId, userFullName, eventTitle, eventLocation, issuedAt, ticketId);
                await _s3Client.PutObjectAsync(new PutObjectRequest
                {
                    BucketName  = _certificateBucketName,
                    Key         = s3Key,
                    InputStream = new MemoryStream(pdfBytes),
                    ContentType = "application/pdf"
                });
                context.Logger.LogLine($"[CERT] PDF uploaded: {s3Key}");
            }
            else
            {
                context.Logger.LogLine($"[CERT] PDF already exists, skipping upload: {s3Key}");
            }

            var presignedUrl = _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
            {
                BucketName = _certificateBucketName,
                Key        = s3Key,
                Expires    = DateTime.UtcNow.AddMinutes(60)
            });

            // ── SES email ─────────────────────────────────────────────────
            bool emailSent = false;
            string message = "Check-in thành công. Certificate đã được tạo.";

            if (!string.IsNullOrWhiteSpace(userEmail))
            {
                var (sent, sesError) = await TrySendCertificateEmailAsync(
                    userEmail, userFullName, eventTitle, presignedUrl, context);
                emailSent = sent;
                if (!sent)
                {
                    context.Logger.LogLine($"[CERT] SES failed (non-fatal): {sesError}");
                    message = "Check-in thành công. Certificate đã được tạo nhưng gửi email thất bại.";
                }
            }
            else
            {
                context.Logger.LogLine("[CERT] UserEmail empty — skipping SES.");
                message = "Check-in thành công. Certificate đã được tạo (không có email để gửi).";
            }

            return (presignedUrl, emailSent, message);
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"[CERT ERROR] Certificate generation failed: {ex.Message}");
            // Certificate failure must NOT fail check-in; return null URL + emailSent=false
            return (null, false, "Check-in thành công. Tạo certificate thất bại — vui lòng thử tải lại qua /certificates-v2.");
        }
    }

    // ─────────────────────────────────────────────────────────────
    // SES: returns (bool success, string? error) — never throws
    // User-provided values are HTML-escaped before insertion
    // ─────────────────────────────────────────────────────────────
    private async Task<(bool Success, string? ErrorMessage)> TrySendCertificateEmailAsync(
        string toEmail,
        string fullName,
        string eventTitle,
        string downloadUrl,
        ILambdaContext context)
    {
        try
        {
            // Escape user-provided values that appear inside HTML
            var safeFullName   = HttpUtility.HtmlEncode(fullName);
            var safeEventTitle = HttpUtility.HtmlEncode(eventTitle);
            // downloadUrl is a presigned S3 URL generated by this service — not user-supplied.
            // It is URL-encoded by the SDK; we keep it as-is for the href attribute.

            var sendRequest = new SendEmailRequest
            {
                FromEmailAddress = _sesFromEmail,
                Destination = new Destination
                {
                    ToAddresses = new List<string> { toEmail }
                },
                Content = new EmailContent
                {
                    Simple = new Message
                    {
                        Subject = new Content { Data = $"Certificate - {safeEventTitle}" },
                        Body = new Body
                        {
                            Html = new Content
                            {
                                Data = $@"
<html>
<body style='font-family:Arial,sans-serif;color:#222'>
<h2>Xin chào {safeFullName},</h2>
<p>Cảm ơn bạn đã tham gia sự kiện:</p>
<h3>{safeEventTitle}</h3>
<p>Certificate của bạn đã sẵn sàng.</p>
<p>
  <a href='{downloadUrl}'
     style='background:#2563eb;padding:12px 20px;color:#fff;
            text-decoration:none;border-radius:6px;display:inline-block'>
    📄 Download Certificate
  </a>
</p>
<p>Trân trọng,<br/>AWS Event Management Platform</p>
</body>
</html>"
                            }
                        }
                    }
                }
            };

            await _sesClient.SendEmailAsync(sendRequest);
            context.Logger.LogLine($"[SES] Email sent to {toEmail}");
            return (true, null);
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"[SES ERROR] Failed to send email to {toEmail}: {ex.Message}");
            return (false, ex.Message);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GET /admin/events/{eventId}/attendees  (Cognito protected)
    // Query tickets via EventTicketsIndex GSI, then query Attendance
    // table by EventId to determine check-in status per ticket.
    // No DynamoDB Scan used.
    // ─────────────────────────────────────────────────────────────
    private async Task<APIGatewayProxyResponse> HandleGetEventAttendeesAsync(
        string? eventId,
        ILambdaContext context)
    {
        if (string.IsNullOrWhiteSpace(eventId))
            return CreateResponse(HttpStatusCode.BadRequest, new { success = false, message = "Thiếu eventId." });

        context.Logger.LogLine($"[ATTENDEES] Fetching attendees for EventId={eventId}");

        // ── 1. Query all tickets for this event via GSI (no Scan) ──────
        var allTickets = new List<Dictionary<string, AttributeValue>>();
        Dictionary<string, AttributeValue>? ticketLastKey = null;
        do
        {
            var ticketsRequest = new QueryRequest
            {
                TableName = _ticketTableName,
                IndexName = "EventTicketsIndex",
                KeyConditionExpression = "#eid = :eid",
                ExpressionAttributeNames  = new Dictionary<string, string> { ["#eid"] = "EventId" },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":eid"] = new AttributeValue { S = eventId }
                },
                ExclusiveStartKey = ticketLastKey
            };
            var ticketsResponse = await _dynamoDb.QueryAsync(ticketsRequest);
            allTickets.AddRange(ticketsResponse.Items ?? new List<Dictionary<string, AttributeValue>>());
            ticketLastKey = ticketsResponse.LastEvaluatedKey?.Count > 0 ? ticketsResponse.LastEvaluatedKey : null;
        } while (ticketLastKey != null);

        // ── 2. Query all attendance records for this event (PK=EventId) ─
        var checkedInSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var checkInAtMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        Dictionary<string, AttributeValue>? attendanceLastKey = null;
        do
        {
            var attendanceRequest = new QueryRequest
            {
                TableName = _attendanceTableName,
                KeyConditionExpression = "#eid = :eid",
                ExpressionAttributeNames  = new Dictionary<string, string> { ["#eid"] = "EventId" },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":eid"] = new AttributeValue { S = eventId }
                },
                ExclusiveStartKey = attendanceLastKey
            };
            var attendanceResponse = await _dynamoDb.QueryAsync(attendanceRequest);
            foreach (var record in attendanceResponse.Items ?? new List<Dictionary<string, AttributeValue>>())
            {
                var tid = GetString(record, "TicketId");
                if (!string.IsNullOrWhiteSpace(tid))
                {
                    checkedInSet.Add(tid);
                    checkInAtMap[tid] = GetString(record, "CheckInAt");
                }
            }
            attendanceLastKey = attendanceResponse.LastEvaluatedKey?.Count > 0 ? attendanceResponse.LastEvaluatedKey : null;
        } while (attendanceLastKey != null);

        // ── 3. Join: derive status from Attendance, not ticket Status field ─
        var attendees = allTickets.Select(t =>
        {
            var tid = GetString(t, "TicketId");
            var isCheckedIn = checkedInSet.Contains(tid);
            return new
            {
                ticketId     = tid,
                userFullName = GetString(t, "UserFullName"),
                userEmail    = GetString(t, "UserEmail"),
                eventTitle   = GetString(t, "EventTitle"),
                status       = isCheckedIn ? "CHECKED_IN" : "NOT_CHECKED_IN",
                checkInAt    = isCheckedIn ? checkInAtMap.GetValueOrDefault(tid, string.Empty) : string.Empty
            };
        }).ToList();

        var checkedInCount    = attendees.Count(a => a.status == "CHECKED_IN");
        var notCheckedInCount = attendees.Count - checkedInCount;

        context.Logger.LogLine($"[ATTENDEES] EventId={eventId}, Total={attendees.Count}, CheckedIn={checkedInCount}");

        return CreateResponse(HttpStatusCode.OK, new
        {
            success      = true,
            eventId,
            total        = attendees.Count,
            checkedIn    = checkedInCount,
            notCheckedIn = notCheckedInCount,
            attendees
        });
    }

    // ─────────────────────────────────────────────────────────────
    // PDF generation (shared by check-in and certificate endpoint)
    // ─────────────────────────────────────────────────────────────
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
                            .FontSize(22).Bold().FontColor(Colors.Blue.Darken3);

                        column.Item().AlignCenter().Text("CERTIFICATE OF ATTENDANCE")
                            .FontSize(36).Bold().FontColor(Colors.Blue.Darken4);

                        column.Item().AlignCenter().Text("This certifies that").FontSize(18);

                        column.Item().AlignCenter().Text(userFullName.ToUpperInvariant())
                            .FontSize(34).Bold().FontColor(Colors.Black);

                        column.Item().AlignCenter().Text("has successfully participated in").FontSize(18);

                        column.Item().AlignCenter().Text(eventTitle)
                            .FontSize(28).Bold().FontColor(Colors.Blue.Darken2);

                        column.Item().AlignCenter().Text($"Location: {eventLocation}").FontSize(18);

                        column.Item().PaddingTop(20).Row(row =>
                        {
                            row.RelativeItem().Column(left =>
                            {
                                left.Item().Text($"Certificate ID: {certificateId}").FontSize(14);
                                left.Item().Text($"Ticket ID: {ticketId}").FontSize(12);
                                left.Item().Text($"Issued Date: {issuedAt}").FontSize(14);
                            });

                            row.RelativeItem().AlignRight().Column(right =>
                            {
                                right.Item().AlignCenter().Text("Authorized Signature").FontSize(14);
                                right.Item().PaddingTop(20).Width(180).LineHorizontal(1);
                                right.Item().AlignCenter().Text("Event Organizer").FontSize(14);
                            });
                        });

                        column.Item().PaddingTop(10).AlignCenter()
                            .Text("Issued by AWS Event Management Platform")
                            .FontSize(13).FontColor(Colors.Grey.Darken2);
                    });
            });
        }).GeneratePdf();
    }

    // ─────────────────────────────────────────────────────────────
    // DynamoDB helpers
    // ─────────────────────────────────────────────────────────────
    private async Task<bool> CertificateExistsOnS3Async(string s3Key, ILambdaContext context)
    {
        try
        {
            await _s3Client.GetObjectMetadataAsync(new GetObjectMetadataRequest
            {
                BucketName = _certificateBucketName,
                Key = s3Key
            });
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"[WARNING] S3 metadata check failed: {ex.Message}. Will regenerate.");
            return false;
        }
    }

    private async Task<List<Dictionary<string, AttributeValue>>>
        QueryTicketsByEventAsync(string eventId)
    {
        var allItems = new List<Dictionary<string, AttributeValue>>();
        Dictionary<string, AttributeValue>? lastEvaluatedKey = null;

        do
        {
            var request = new QueryRequest
            {
                TableName = _ticketTableName,
                IndexName = "EventTicketsIndex",
                KeyConditionExpression = "#eventId = :eventId",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#eventId"] = "EventId"
                },
                ExpressionAttributeValues =
                    new Dictionary<string, AttributeValue>
                    {
                        [":eventId"] = new AttributeValue
                        {
                            S = eventId
                        }
                    },
                ExclusiveStartKey = lastEvaluatedKey
            };

            var response = await _dynamoDb.QueryAsync(request);

            if (response.Items != null)
            {
                allItems.AddRange(response.Items);
            }

            lastEvaluatedKey =
                response.LastEvaluatedKey != null
                && response.LastEvaluatedKey.Count > 0
                    ? response.LastEvaluatedKey
                    : null;
        }
        while (lastEvaluatedKey != null);

        return allItems;
    }

    private async Task<List<Dictionary<string, AttributeValue>>>
        QueryAttendanceByEventAsync(string eventId)
    {
        var allItems = new List<Dictionary<string, AttributeValue>>();
        Dictionary<string, AttributeValue>? lastEvaluatedKey = null;

        do
        {
            var request = new QueryRequest
            {
                TableName = _attendanceTableName,
                KeyConditionExpression = "#eventId = :eventId",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#eventId"] = "EventId"
                },
                ExpressionAttributeValues =
                    new Dictionary<string, AttributeValue>
                    {
                        [":eventId"] = new AttributeValue
                        {
                            S = eventId
                        }
                    },
                ExclusiveStartKey = lastEvaluatedKey
            };

            var response = await _dynamoDb.QueryAsync(request);

            if (response.Items != null)
            {
                allItems.AddRange(response.Items);
            }

            lastEvaluatedKey =
                response.LastEvaluatedKey != null
                && response.LastEvaluatedKey.Count > 0
                    ? response.LastEvaluatedKey
                    : null;
        }
        while (lastEvaluatedKey != null);

        return allItems;
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

        return response.Item == null || response.Item.Count == 0 ? null : response.Item;
    }

    private async Task<bool> IsAlreadyCheckedInAsync(string eventId, string ticketId)
    {
        if (string.IsNullOrWhiteSpace(eventId) || string.IsNullOrWhiteSpace(ticketId)) return false;

        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _attendanceTableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["EventId"]  = new AttributeValue { S = eventId },
                ["TicketId"] = new AttributeValue { S = ticketId }
            }
        });

        return response.Item != null && response.Item.Count > 0;
    }

    private async Task SaveAttendanceAsync(
        string eventId, string ticketId, string userId,
        string userEmail, string userFullName, string eventTitle,
        string checkInAt, string checkInMethod)
    {
        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _attendanceTableName,
            Item = new Dictionary<string, AttributeValue>
            {
                ["EventId"]      = new AttributeValue { S = eventId },
                ["TicketId"]     = new AttributeValue { S = ticketId },
                ["UserId"]       = new AttributeValue { S = userId },
                ["UserEmail"]    = new AttributeValue { S = userEmail },
                ["UserFullName"] = new AttributeValue { S = userFullName },
                ["EventTitle"]   = new AttributeValue { S = eventTitle },
                ["Status"]       = new AttributeValue { S = "ATTENDED" },
                ["CheckInMethod"] = new AttributeValue { S = checkInMethod },
                ["CheckInAt"]    = new AttributeValue { S = checkInAt },
                ["CreatedAt"]    = new AttributeValue { S = checkInAt }
            },
            ConditionExpression = "attribute_not_exists(EventId) AND attribute_not_exists(TicketId)"
        });
    }

    private async Task UpdateTicketAfterCheckInAsync(string ticketId, string checkInAt)
    {
        await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
        {
            TableName = _ticketTableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["TicketId"] = new AttributeValue { S = ticketId }
            },
            UpdateExpression = "SET #status = :status, #checkedInAt = :checkedInAt",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#status"]      = "Status",
                ["#checkedInAt"] = "CheckedInAt"
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":status"]      = new AttributeValue { S = "CHECKED_IN" },
                [":checkedInAt"] = new AttributeValue { S = checkInAt }
            }
        });
    }

    private static string GetString(Dictionary<string, AttributeValue> item, string key)
    {
        if (item.TryGetValue(key, out var value)) return value.S ?? string.Empty;
        var camelKey = char.ToLowerInvariant(key[0]) + key[1..];
        return item.TryGetValue(camelKey, out var camelValue) ? camelValue.S ?? string.Empty : string.Empty;
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
                ["Content-Type"]                 = "application/json",
                ["Access-Control-Allow-Origin"]  = "*",
                ["Access-Control-Allow-Headers"] = "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
                ["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
            }
        };
    }
}
