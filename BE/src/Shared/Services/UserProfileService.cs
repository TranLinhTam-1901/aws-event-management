using EventManagement.Shared.DTOs.Users;
using EventManagement.Shared.Models.Enums;
using EventManagement.Shared.Repositories;

namespace EventManagement.Shared.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly Amazon.S3.IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public UserProfileService(IUserProfileRepository userProfileRepository, Amazon.S3.IAmazonS3 s3Client = null!)
    {
        _userProfileRepository = userProfileRepository;
        _s3Client = s3Client ?? new Amazon.S3.AmazonS3Client();
        _bucketName = Environment.GetEnvironmentVariable("AVATAR_BUCKET_NAME") ?? string.Empty;
    }

    public async Task<InitProfileResponseDto> InitProfileAsync(
        string userId,
        string email,
        string fullName,
        bool isAdmin = false
    )
    {
        var now = DateTime.UtcNow.ToString("O");

        var existingProfile = await _userProfileRepository.GetByUserIdAsync(userId);

        var role = isAdmin ? UserRole.ADMIN : UserRole.USER;
        
        if (existingProfile == null)
        {
            var newProfile = new UserProfileDto
            {
                UserId = userId,
                Email = email,
                FullName = fullName,
                AvatarUrl = string.Empty,
                Role = role,
                Status = UserStatus.ACTIVE,
                CreatedAt = now,
                UpdatedAt = now,
                LastLoginAt = now
            };

            await _userProfileRepository.CreateAsync(newProfile);

            return new InitProfileResponseDto
            {
                IsNewUser = true,
                Profile = newProfile
            };
        }

        await _userProfileRepository.UpdateLastLoginAsync(userId, now, role);

        existingProfile.UpdatedAt = now;
        existingProfile.LastLoginAt = now;
        existingProfile.Role = role;

        if (!string.IsNullOrWhiteSpace(fullName))
        {
            existingProfile.FullName = fullName;
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            existingProfile.Email = email;
        }

        return new InitProfileResponseDto
        {
            IsNewUser = false,
            Profile = existingProfile
        };
    }

    public async Task<UserProfileDto?> GetMyProfileAsync(string userId)
    {
        return await _userProfileRepository.GetByUserIdAsync(userId);
    }

    public async Task<List<UserProfileDto>> GetAllProfilesAsync(string? email = null)
    {
        return await _userProfileRepository.GetAllAsync(email);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
        {
            throw new ArgumentException("Full name cannot be empty.");
        }

        var now = DateTime.UtcNow.ToString("O");
        
        // Gọi xuống repository thực hiện UpdateItem trong DynamoDB
        await _userProfileRepository.UpdateProfileAsync(userId, dto.FullName, dto.AvatarUrl, now);

        // Lấy lại dữ liệu mới nhất để trả về cho Client
        var updatedProfile = await _userProfileRepository.GetByUserIdAsync(userId);
        return updatedProfile ?? throw new Exception("Profile not found after update.");
    }

    public async Task<UserProfileDto> SetUserStatusAsync(string userId, UserStatus status)
    {
        var profile = await _userProfileRepository.GetByUserIdAsync(userId);
        if (profile == null)
        {
            throw new ArgumentException("User profile not found.");
        }

        var now = DateTime.UtcNow.ToString("O");
        await _userProfileRepository.UpdateStatusAsync(userId, status, now);

        var updatedProfile = await _userProfileRepository.GetByUserIdAsync(userId);
        return updatedProfile ?? throw new Exception("Profile not found after status update.");
    }

    // ==========================================
    // THÊM MỚI: Sinh Presigned URL đẩy trực tiếp lên S3
    // ==========================================
    public async Task<GetAvatarUploadUrlResponseDto> GenerateAvatarUploadUrlAsync(string userId, string contentType)
    {
        // Xác định phần mở rộng dựa trên contentType (hoặc mặc định .png)
        var ext = contentType.Contains("jpeg") || contentType.Contains("jpg") ? "jpg" : "png";
        
        // Cấu trúc file key phân tách theo userId để tránh ghi đè chéo file của nhau
        var fileKey = $"avatars/{userId}/avatar_{DateTime.UtcNow.Ticks}.{ext}";

        var request = new Amazon.S3.Model.GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = fileKey,
            Verb = Amazon.S3.HttpVerb.PUT, // Bắt buộc trùng khớp phương thức PUT ở FE
            Expires = DateTime.UtcNow.AddMinutes(15), // URL có hiệu lực trong 15p
            ContentType = contentType
        };

        var uploadUrl = await _s3Client.GetPreSignedURLAsync(request);
        
        // Trả về url sạch (không chứa tham số query) để lưu vào DB sau khi upload xong
        var finalAvatarUrl = $"https://{_bucketName}.s3.amazonaws.com/{fileKey}";

        return new GetAvatarUploadUrlResponseDto
        {
            UploadUrl = uploadUrl,
            AvatarUrl = finalAvatarUrl
        };
    }
}