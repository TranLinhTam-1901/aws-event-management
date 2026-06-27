using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.DynamoDBv2;
using EventManagement.Shared.Repositories;
using EventManagement.Shared.Services;
using System.Text.Json;
using EventManagement.Shared.DTOs.Tickets;
using System.Net;
// Assembly attribute để AWS Lambda biết cách serialize/deserialize JSON sang object .NET
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.RegistrationTicketLambda;


public class Function
{
    private readonly IAmazonDynamoDB _dynamoDbClient;
    private readonly ITicketRepository _ticketRepository;
    private readonly ITicketService _ticketService;
    private readonly string _ticketTableName;
    private readonly string _eventTableName;

    private readonly IUserProfileService _userProfileService;
    private readonly string _userTableName;

    public Function()
    {
        // Đọc tên bảng từ biến môi trường cấu hình trong template.yaml
        _ticketTableName = Environment.GetEnvironmentVariable("TICKET_TABLE_NAME") ?? "EventManagementTickets";
        _eventTableName = Environment.GetEnvironmentVariable("EVENT_TABLE_NAME") ?? "EventManagementEvents";

        _dynamoDbClient = new AmazonDynamoDBClient();
        
        // Khởi tạo tầng Chọc DB và tầng Logic Nghiệp vụ theo đúng mã nguồn ông cung cấp
        _ticketRepository = new TicketRepository(_dynamoDbClient, _ticketTableName, _eventTableName);
        _ticketService = new TicketService(_ticketRepository);

        _userTableName = Environment.GetEnvironmentVariable("USER_TABLE_NAME") ?? "EventManagementUsers";

        var userProfileRepository = new UserProfileRepository(_dynamoDbClient, _userTableName);
        _userProfileService = new UserProfileService(userProfileRepository);
    }

    /// <summary>
    /// Hàm xử lý chính tiếp nhận Request từ API Gateway định tuyến cho module Vé
    /// </summary>
    public async Task<APIGatewayProxyResponse> FunctionHandler(
        APIGatewayProxyRequest request,
        ILambdaContext context
    )
    {
        context.Logger.LogLine($"[REQUEST] Method: {request.HttpMethod}, Resource: {request.Resource}, Path: {request.Path}");

        try
        {
            // 1. Trích xuất thông tin định danh của User từ Cognito Token (Đồng bộ logic với UserProfileLambda)
            var userClaims = ExtractJwtClaims(request, context);
            if (userClaims == null)
            {
                return CreateResponse(HttpStatusCode.Unauthorized, new { message = "Yêu cầu không hợp lệ. Vui lòng đăng nhập lại!" });
            }

            // 2. Định tuyến API (Routing) dựa trên Resource định nghĩa trong SAM template
            switch (request.Resource)
            {
                // ROUTE 1: POST /events/{eventId}/register
                case "/events/{eventId}/register" when request.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase):
                    return await HandleRegisterTicketAsync(request, userClaims, context);

                // ROUTE 2: GET /my-tickets
                case "/my-tickets" when request.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase):
                    return await HandleGetMyTicketsAsync(userClaims, context);

                default:
                    return CreateResponse(HttpStatusCode.NotFound, new { message = $"Đường dẫn API {request.HttpMethod} {request.Path} không tồn tại." });
            }
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"[CRITICAL ERROR] FunctionHandler failed: {ex.Message} \n {ex.StackTrace}");
            return CreateResponse(HttpStatusCode.InternalServerError, new { message = "Lỗi hệ thống nội bộ từ phía Server.", detail = ex.Message });
        }
    }

    /// <summary>
    /// Xử lý Đăng ký vé: POST /events/{eventId}/register
    /// </summary>
    /// <summary>
    /// Xử lý Đăng ký vé: POST /events/{eventId}/register
    /// </summary>
    private async Task<APIGatewayProxyResponse> HandleRegisterTicketAsync(
        APIGatewayProxyRequest request, 
        JwtClaims userClaims, 
        ILambdaContext context)
    {
        if (request.PathParameters == null || !request.PathParameters.TryGetValue("eventId", out var eventId) || string.IsNullOrEmpty(eventId))
        {
            return CreateResponse(HttpStatusCode.BadRequest, new { message = "Thiếu tham số mã sự kiện (eventId) trên URL." });
        }

        context.Logger.LogLine($"User [{userClaims.UserId}] đang yêu cầu đăng ký vé cho Sự kiện [{eventId}]");

        // 🔴 Khởi tạo biến gán tên, mặc định lấy từ Token làm fallback
        var finalFullName = userClaims.FullName;

        // 🔴 CRITICAL FIX: Chọc trực tiếp vào bảng User thông qua Service dùng chung
        try
        {
            var userProfile = await _userProfileService.GetMyProfileAsync(userClaims.UserId);
            if (userProfile != null && !string.IsNullOrWhiteSpace(userProfile.FullName))
            {
                finalFullName = userProfile.FullName;
                context.Logger.LogLine($"[Sync Success] Lấy thành công tên đã cập nhật từ DynamoDB: [{finalFullName}]");
            }
        }
        catch (Exception ex)
        {
            // Bọc lỗi riêng tại đây để tránh việc lỗi bảng User làm đứng luồng Đăng ký vé
            context.Logger.LogLine($"[Warning] Không thể lấy tên mới từ UserProfileService: {ex.Message}. Sử dụng fallback từ Token.");
        }

        try
        {
            if (!string.IsNullOrEmpty(request.Body))
            {
                try
                {
                    var requestDto = JsonSerializer.Deserialize<RegisterTicketRequestDto>(request.Body);
                    if (requestDto != null && !string.IsNullOrEmpty(requestDto.Note))
                    {
                        context.Logger.LogLine($"[Ghi chú đính kèm]: {requestDto.Note}");
                    }
                }
                catch (Exception jsonEx)
                {
                    context.Logger.LogLine($"[Warning] Không thể parse Request Body sang RegisterTicketRequestDto: {jsonEx.Message}");
                }
            }

            // 🔴 THAY THẾ: Truyền finalFullName (Đã đồng bộ) thay cho thuộc tính cũ từ token
            var ticketResult = await _ticketService.RegisterTicketAsync(eventId, userClaims.UserId, userClaims.Email, finalFullName);
            
            context.Logger.LogLine($"Đăng ký vé thành công! Mã vé: [{ticketResult.TicketId}]");
            return CreateResponse(HttpStatusCode.Created, ticketResult);
        }
        catch (KeyNotFoundException knfEx)
        {
            context.Logger.LogLine($"[Business Alert] {knfEx.Message}");
            return CreateResponse(HttpStatusCode.NotFound, new { message = knfEx.Message });
        }
        catch (InvalidOperationException ioEx)
        {
            context.Logger.LogLine($"[Business Alert] {ioEx.Message}");
            return CreateResponse(HttpStatusCode.BadRequest, new { message = ioEx.Message });
        }
    }

    
    /// <summary>
    /// Xử lý lấy danh sách vé cá nhân: GET /my-tickets
    /// </summary>
    private async Task<APIGatewayProxyResponse> HandleGetMyTicketsAsync(JwtClaims userClaims, ILambdaContext context)
    {
        context.Logger.LogLine($"Đang quét tìm toàn bộ vé của User: [{userClaims.UserId}]");

        // Gọi phương thức lấy danh sách vé thông qua GSI từ TicketService
        var tickets = await _ticketService.GetUserTicketsAsync(userClaims.UserId);

        return CreateResponse(HttpStatusCode.OK, tickets);
    }


    /// <summary>
    /// Bóc tách thông tin Claims từ AWS Cognito Authorizer, bao gồm cả mảng Groups định danh quyền
    /// </summary>
   private JwtClaims? ExtractJwtClaims(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            // Kiểm tra xem có phải đang chạy bằng SAM Local dưới máy hay không
            bool isLocal = Environment.GetEnvironmentVariable("AWS_SAM_LOCAL") == "true";

            if (request.RequestContext?.Authorizer?.Claims == null) 
            {
                // Nếu chạy Local mà không có Token, tự động inject User giả lập để test luồng
                if (isLocal)
                {
                    context.Logger.LogLine("[LOCAL TESTING] Không tìm thấy Cognito Claims. Tự động kích hoạt Mock JwtClaims!");
                    return new JwtClaims
                    {
                        UserId = "usr-test-999",
                        Email = "linhtam.dev@gmail.com",
                        FullName = "Tran Linh Tam",
                        Groups = new List<string> { "User" } // Có thể đổi thành "Admin" nếu muốn test quyền admin
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

            context.Logger.LogLine($"Extracted -> userId: {userId}, email: {email}, fullName: {fullName}, groups: [{string.Join(",", groups)}]");

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

    /// <summary>
    /// Tạo cấu trúc phản hồi HTTP chuẩn kèm theo CORS Header để tránh lỗi chặn kết nối từ FE Localhost
    /// </summary>
    private APIGatewayProxyResponse CreateResponse(HttpStatusCode statusCode, object body)
    {

        var serializeOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        return new APIGatewayProxyResponse
        {
            StatusCode = (int)statusCode,
            Body = JsonSerializer.Serialize(body, serializeOptions),
            Headers = new Dictionary<string, string> 
            { 
                { "Content-Type", "application/json" },
                { "Access-Control-Allow-Origin", "*" },
                { "Access-Control-Allow-Headers", "Content-Type,Authorization" },
                { "Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS" }
            }
        };
    }

 
}


/// <summary>
/// DTO chứa thông tin Token claims đồng bộ cấu trúc hệ thống
/// </summary>
public class JwtClaims
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public List<string> Groups { get; set; } = new();

    public bool IsAdmin => Groups.Contains("Admin");
}