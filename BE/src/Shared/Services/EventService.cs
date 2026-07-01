using Amazon.S3;
using Amazon.S3.Model;
using EventManagement.Shared.DTOs.Events;
using EventManagement.Shared.Helpers;
using EventManagement.Shared.Repositories;

namespace EventManagement.Shared.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _repository;
    private readonly ICategoryService? _categoryService;
    private readonly IAmazonS3 _s3Client;
    private readonly string _bannerBucketName;

    public EventService(
        IEventRepository repository,
        IAmazonS3? s3Client = null,
        string? bannerBucketName = null,
        ICategoryService? categoryService = null)
    {
        _repository = repository;
        _categoryService = categoryService;
        _s3Client = s3Client ?? new AmazonS3Client();
        _bannerBucketName = bannerBucketName
            ?? Environment.GetEnvironmentVariable("BANNER_BUCKET_NAME")
            ?? string.Empty;
    }

    public async Task<List<EventResponseDto>> GetPublicEventsAsync()
    {
        var events = await _repository.GetAllAsync();

        return events
            .Select(EventStatusHelper.ApplyEffectiveStatus)
            .Where(EventStatusHelper.IsPublicVisible)
            .Select(PrepareForResponse)
            .ToList();
    }

    public async Task<List<EventResponseDto>> GetAdminEventsAsync()
    {
        var events = await _repository.GetAllAsync();

        return events
            .Select(EventStatusHelper.ApplyEffectiveStatus)
            .Select(PrepareForResponse)
            .ToList();
    }

    public async Task<EventResponseDto?> GetPublicEventByIdAsync(string eventId)
    {
        var eventItem = await _repository.GetByIdAsync(eventId);

        if (eventItem == null)
        {
            return null;
        }

        var effective = EventStatusHelper.ApplyEffectiveStatus(eventItem);

        if (!EventStatusHelper.IsPublicDetailVisible(effective))
        {
            return null;
        }

        return PrepareForResponse(effective);
    }

    public async Task<EventResponseDto?> GetAdminEventByIdAsync(string eventId)
    {
        var eventItem = await _repository.GetByIdAsync(eventId);

        if (eventItem == null)
        {
            return null;
        }

        return PrepareForResponse(EventStatusHelper.ApplyEffectiveStatus(eventItem));
    }

    public async Task<EventResponseDto> CreateEventAsync(
        EventCreateRequestDto request)
    {
        ValidateEvent(
            request.StartTime,
            request.EndTime,
            request.MaxSlots);

        var (categoryId, categoryName) = await ResolveCategoryFieldsAsync(
            request.CategoryId,
            request.Category);

        var eventItem = new EventResponseDto
        {
            EventId = Guid.NewGuid().ToString(),

            Title = request.Title,
            Description = request.Description,
            Location = request.Location,

            StartTime = request.StartTime,
            EndTime = request.EndTime,

            BannerUrl = request.BannerUrl,

            CategoryId = categoryId,
            Category = categoryName,
            SpeakerName = request.SpeakerName,
            Prerequisites = request.Prerequisites,
            RequiredTools = request.RequiredTools,

            MaxSlots = request.MaxSlots,
            RegisteredCount = 0,

            Status = EventStatusHelper.Active,
            IsVisible = true
        };

        await _repository.CreateAsync(eventItem);

        return PrepareForResponse(EventStatusHelper.ApplyEffectiveStatus(eventItem));
    }

    public async Task<EventResponseDto> UpdateEventAsync(
        string eventId,
        EventUpdateRequestDto request)
    {
        var existing = await _repository.GetByIdAsync(eventId);

        if (existing == null)
        {
            throw new Exception("Event not found");
        }

        ValidateEvent(
            request.StartTime,
            request.EndTime,
            request.MaxSlots);

        if (request.MaxSlots < existing.RegisteredCount)
        {
            throw new Exception(
                $"Số slot không thể nhỏ hơn số người đã đăng ký ({existing.RegisteredCount}).");
        }

        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.Location = request.Location;

        existing.StartTime = request.StartTime;
        existing.EndTime = request.EndTime;

        existing.BannerUrl = NormalizeStoredBannerUrl(request.BannerUrl, existing.BannerUrl);

        var (categoryId, categoryName) = await ResolveCategoryFieldsAsync(
            request.CategoryId,
            request.Category);

        existing.CategoryId = categoryId;
        existing.Category = categoryName;
        existing.SpeakerName = request.SpeakerName;
        existing.Prerequisites = request.Prerequisites;
        existing.RequiredTools = request.RequiredTools;

        existing.MaxSlots = request.MaxSlots;

        await _repository.UpdateAsync(existing);

        return PrepareForResponse(EventStatusHelper.ApplyEffectiveStatus(existing));
    }

    public async Task SetEventVisibilityAsync(string eventId, bool isVisible)
    {
        var existing = await _repository.GetByIdAsync(eventId);

        if (existing == null)
        {
            throw new Exception("Event not found");
        }

        var effective = EventStatusHelper.ApplyEffectiveStatus(existing);

        if (isVisible && EventStatusHelper.IsEnded(effective.Status))
        {
            throw new Exception("Cannot show an event that has already ended.");
        }

        await _repository.SetVisibilityAsync(eventId, isVisible);
    }

    public Task<GetEventBannerUploadUrlResponseDto> GenerateBannerUploadUrlAsync(
        string? eventId,
        string contentType)
    {
        if (string.IsNullOrWhiteSpace(_bannerBucketName))
        {
            throw new Exception("Banner bucket is not configured.");
        }

        var ext = contentType.Contains("jpeg", StringComparison.OrdinalIgnoreCase)
            || contentType.Contains("jpg", StringComparison.OrdinalIgnoreCase)
            ? "jpg"
            : contentType.Contains("webp", StringComparison.OrdinalIgnoreCase)
                ? "webp"
                : "png";

        var folder = string.IsNullOrWhiteSpace(eventId) ? "drafts" : eventId;
        var fileKey = $"banners/{folder}/banner_{DateTime.UtcNow.Ticks}.{ext}";

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bannerBucketName,
            Key = fileKey,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(15),
            ContentType = contentType
        };

        var uploadUrl = _s3Client.GetPreSignedURL(request);
        var region = _s3Client.Config.RegionEndpoint?.SystemName ?? "us-east-1";
        var bannerUrl = $"https://{_bannerBucketName}.s3.{region}.amazonaws.com/{fileKey}";

        return Task.FromResult(new GetEventBannerUploadUrlResponseDto
        {
            UploadUrl = uploadUrl,
            BannerUrl = bannerUrl
        });
    }

    private EventResponseDto PrepareForResponse(EventResponseDto evt)
    {
        evt.BannerDisplayUrl = ResolveBannerAccessUrl(evt.BannerUrl);
        return evt;
    }

    private string ResolveBannerAccessUrl(string bannerUrl)
    {
        if (string.IsNullOrWhiteSpace(bannerUrl))
        {
            return string.Empty;
        }

        if (string.IsNullOrWhiteSpace(_bannerBucketName))
        {
            return bannerUrl;
        }

        if (!bannerUrl.Contains(_bannerBucketName, StringComparison.OrdinalIgnoreCase))
        {
            return bannerUrl;
        }

        var key = TryExtractBannerKey(bannerUrl);
        if (string.IsNullOrWhiteSpace(key))
        {
            return bannerUrl;
        }

        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bannerBucketName,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.AddHours(24)
            };

            return _s3Client.GetPreSignedURL(request);
        }
        catch
        {
            return bannerUrl;
        }
    }

    private static string? TryExtractBannerKey(string bannerUrl)
    {
        if (!Uri.TryCreate(bannerUrl, UriKind.Absolute, out var uri))
        {
            return null;
        }

        return Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
    }

    private static string NormalizeStoredBannerUrl(string incoming, string current)
    {
        if (string.IsNullOrWhiteSpace(incoming))
        {
            return current;
        }

        if (incoming.Contains("X-Amz-", StringComparison.OrdinalIgnoreCase))
        {
            return current;
        }

        return incoming;
    }

    private async Task<(string CategoryId, string CategoryName)> ResolveCategoryFieldsAsync(
        string categoryId,
        string categoryName)
    {
        if (_categoryService != null)
        {
            return await _categoryService.ResolveCategoryAsync(categoryId, categoryName);
        }

        if (!string.IsNullOrWhiteSpace(categoryName))
        {
            return (categoryId, categoryName.Trim());
        }

        return (categoryId, string.Empty);
    }

    private static void ValidateEvent(
        string startTime,
        string endTime,
        int maxSlots)
    {
        if (!DateTime.TryParse(startTime, out var start))
        {
            throw new Exception("Invalid StartTime");
        }

        if (!DateTime.TryParse(endTime, out var end))
        {
            throw new Exception("Invalid EndTime");
        }

        if (start >= end)
        {
            throw new Exception("StartTime must be before EndTime");
        }

        if (maxSlots <= 0)
        {
            throw new Exception("MaxSlots must be greater than 0");
        }
    }
}
