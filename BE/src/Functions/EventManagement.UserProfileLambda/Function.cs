using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.DynamoDBv2;
using EventManagement.Shared.Repositories;
using EventManagement.Shared.Services;
using System.Text.Json;
using System.Linq;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.UserProfileLambda;

public class Function
{
    private readonly IAmazonDynamoDB _dynamoDbClient;
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly IUserProfileService _userProfileService;
    private readonly string _tableName;

    public Function()
    {
        _tableName = Environment.GetEnvironmentVariable("USER_TABLE_NAME") ?? "EventManagementUsers";

        _dynamoDbClient = new AmazonDynamoDBClient();
        _userProfileRepository = new UserProfileRepository(_dynamoDbClient, _tableName);
        _userProfileService = new UserProfileService(_userProfileRepository);
    }

    /// <summary>
    /// Lambda function handler for User Profile API Gateway requests
    /// Supports: POST /profile/init and GET /profile/me
    /// </summary>
    public async Task<APIGatewayProxyResponse> FunctionHandler(
        APIGatewayProxyRequest request,
        ILambdaContext context
    )
    {
        context.Logger.LogLine($"Received request: {request.HttpMethod} {request.Path}");

        try
        {
            var claims = ExtractClaimsFromRequest(request, context);

            if (claims == null || string.IsNullOrEmpty(claims.UserId))
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 401,
                    Headers = CorsHeaders(),
                    Body = JsonSerializer.Serialize(new { message = "Unauthorized: Missing or invalid JWT claims" })
                };
            }

            if (request.HttpMethod == "POST" && request.Path == "/profile/init")
            {
                return await HandleInitProfile(claims, context);
            }
            else if (request.HttpMethod == "GET" && request.Path == "/profile/me")
            {
                return await HandleGetProfile(claims, context);
            }
            else if (request.HttpMethod == "PUT" && request.Path == "/profile/me")
            {
                return await HandleUpdateProfile(request, claims, context);
            }
            else if (request.HttpMethod == "GET" && request.Path == "/profile/avatar-upload-url")
            {
                return await HandleGetAvatarUploadUrl(request, claims, context);
            }

            return new APIGatewayProxyResponse
            {
                StatusCode = 404,
                Headers = CorsHeaders(),
                Body = JsonSerializer.Serialize(new { message = "Route not found" })
            };
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"Error: {ex.Message}");
            context.Logger.LogLine($"StackTrace: {ex.StackTrace}");

            return new APIGatewayProxyResponse
            {
                StatusCode = 500,
                Headers = CorsHeaders(),
                Body = JsonSerializer.Serialize(new { message = "Internal server error" })
            };
        }
    }

    /// <summary>
    /// CORS headers bắt buộc phải có trong MỌI response trả về,
    /// kể cả response lỗi (401, 404, 500).
    /// </summary>
    private static Dictionary<string, string> CorsHeaders()
    {
        return new Dictionary<string, string>
        {
            { "Content-Type", "application/json" },
            { "Access-Control-Allow-Origin", "*" },
            { "Access-Control-Allow-Headers", "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token" },
            { "Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS" }
        };
    }

    /// <summary>
    /// Handle POST /profile/init - Initialize user profile
    /// Creates new profile or updates LastLoginAt + Role for existing user
    /// </summary>
    private async Task<APIGatewayProxyResponse> HandleInitProfile(
        JwtClaims claims,
        ILambdaContext context
    )
    {
        try
        {
            context.Logger.LogLine($"Initializing profile for user: {claims.UserId}, isAdmin: {claims.IsAdmin}");

            var response = await _userProfileService.InitProfileAsync(
                claims.UserId,
                claims.Email,
                claims.FullName,
                claims.IsAdmin
            );

            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = CorsHeaders(),
                Body = JsonSerializer.Serialize(response)
            };
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"Error initializing profile: {ex.Message}");
            return new APIGatewayProxyResponse
            {
                StatusCode = 500,
                Headers = CorsHeaders(),
                Body = JsonSerializer.Serialize(new { message = "Failed to initialize profile" })
            };
        }
    }

    /// <summary>
    /// Handle GET /profile/me - Get current user's profile
    /// </summary>
    private async Task<APIGatewayProxyResponse> HandleGetProfile(
        JwtClaims claims,
        ILambdaContext context
    )
    {
        try
        {
            context.Logger.LogLine($"Fetching profile for user: {claims.UserId}");

            var profile = await _userProfileService.GetMyProfileAsync(claims.UserId);

            if (profile == null)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 404,
                    Headers = CorsHeaders(),
                    Body = JsonSerializer.Serialize(new { message = "User profile not found" })
                };
            }

            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = CorsHeaders(),
                Body = JsonSerializer.Serialize(profile)
            };
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"Error fetching profile: {ex.Message}");
            return new APIGatewayProxyResponse
            {
                StatusCode = 500,
                Headers = CorsHeaders(),
                Body = JsonSerializer.Serialize(new { message = "Failed to fetch profile" })
            };
        }
    }



    /// <summary>
    /// Handle PUT /profile/me - Update user's profile info (FullName, AvatarUrl)
    /// </summary>
    private async Task<APIGatewayProxyResponse> HandleUpdateProfile(
        APIGatewayProxyRequest request,
        JwtClaims claims,
        ILambdaContext context
    )
    {
        try
        {
            context.Logger.LogLine($"Updating profile for user: {claims.UserId}");

            if (string.IsNullOrEmpty(request.Body))
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 400,
                    Headers = CorsHeaders(),
                    Body = JsonSerializer.Serialize(new { message = "Missing request body" })
                };
            }

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var updateDto = JsonSerializer.Deserialize<EventManagement.Shared.DTOs.Users.UpdateProfileRequestDto>(request.Body, options);

            if (updateDto == null)
            {
                return new APIGatewayProxyResponse { StatusCode = 400, Headers = CorsHeaders(), Body = JsonSerializer.Serialize(new { message = "Invalid request body format" }) };
            }

            var result = await _userProfileService.UpdateProfileAsync(claims.UserId, updateDto);

            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = CorsHeaders(),
                Body = JsonSerializer.Serialize(new { message = "Profile updated successfully", profile = result })
            };
        }
        catch (ArgumentException ex)
        {
            return new APIGatewayProxyResponse { StatusCode = 400, Headers = CorsHeaders(), Body = JsonSerializer.Serialize(new { message = ex.Message }) };
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"Error updating profile: {ex.Message}");
            return new APIGatewayProxyResponse { StatusCode = 500, Headers = CorsHeaders(), Body = JsonSerializer.Serialize(new { message = "Failed to update profile" }) };
        }
    }

    /// <summary>
    /// Handle GET /profile/avatar-upload-url - Generate S3 Presigned URL for Avatar upload
    /// </summary>
    private async Task<APIGatewayProxyResponse> HandleGetAvatarUploadUrl(
        APIGatewayProxyRequest request,
        JwtClaims claims,
        ILambdaContext context
    )
    {
        try
        {
            context.Logger.LogLine($"Generating avatar upload URL for user: {claims.UserId}");

            // Đọc QueryString để lấy file content-type (ví dụ: image/png, image/jpeg) từ client gửi lên nếu cần
            request.QueryStringParameters.TryGetValue("contentType", out var contentType);
            if (string.IsNullOrEmpty(contentType))
            {
                contentType = "image/png"; // Default fallback
            }

             var response = await _userProfileService.GenerateAvatarUploadUrlAsync(claims.UserId, contentType);

            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = CorsHeaders(),
                Body = JsonSerializer.Serialize(response)
            };
        }
        catch (Exception ex)
        {
            context.Logger.LogLine($"Error generating presigned URL: {ex.Message}");
            return new APIGatewayProxyResponse { StatusCode = 500, Headers = CorsHeaders(), Body = JsonSerializer.Serialize(new { message = "Failed to generate upload URL" }) };
        }
    }

    /// <summary>
    /// Extract JWT claims from API Gateway request context.
    /// Cognito Authorizer (COGNITO_USER_POOLS) đưa claims vào
    /// request.RequestContext.Authorizer.Claims (Dictionary&lt;string,string&gt;).
    /// Request luôn đã qua xác thực JWT tại API Gateway trước khi tới đây -
    /// nếu Authorizer null hoặc Claims rỗng, coi là Unauthorized.
    /// </summary>
    private JwtClaims? ExtractClaimsFromRequest(
        APIGatewayProxyRequest request,
        ILambdaContext context
    )
    {
        try
        {
            if (request.RequestContext?.Authorizer?.Claims == null
                || request.RequestContext.Authorizer.Claims.Count == 0)
            {
                context.Logger.LogLine("No authorizer claims found");
                return null;
            }

            var claims = request.RequestContext.Authorizer.Claims;

            claims.TryGetValue("sub", out var userId);
            claims.TryGetValue("email", out var email);
            claims.TryGetValue("name", out var fullName);
            claims.TryGetValue("cognito:groups", out var groupsRaw);

            // Cognito trả "cognito:groups" dạng chuỗi "[Admins]" hoặc
            // "[Admins, Organizers]" (không phải JSON array thật).
            // Nếu user không thuộc group nào, claim này không tồn tại
            // -> groupsRaw là null, đây là trường hợp BÌNH THƯỜNG.
            var groups = new List<string>();
            if (!string.IsNullOrEmpty(groupsRaw))
            {
                groups = groupsRaw
                    .Trim('[', ']')
                    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                    .ToList();
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
}

    /// <summary>
    /// DTO for extracted JWT claims from Cognito Authorizer
    /// </summary>
    public class JwtClaims
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Danh sách group user thuộc về, lấy từ claim "cognito:groups".
        /// Rỗng nếu user không thuộc group nào (trường hợp bình thường,
        /// không phải lỗi) - khi đó coi là user thường.
        /// </summary>
        public List<string> Groups { get; set; } = new();

        /// <summary>
        /// true nếu user thuộc group "Admins"
        /// </summary>
        public bool IsAdmin => Groups.Contains("Admins");
    }