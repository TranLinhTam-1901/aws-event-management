using System.Globalization;
using EventManagement.Shared.DTOs.Events;

namespace EventManagement.Shared.Helpers;

public static class EventStatusHelper
{
    public const string Draft = "Draft";
    public const string Active = "Active";
    public const string Ended = "Ended";
    public const string Cancelled = "Cancelled";

    public static string Normalize(string? status)
    {
        return status?.ToUpperInvariant() switch
        {
            "ACTIVE" => Active,
            "ENDED" => Ended,
            "CANCELLED" => Cancelled,
            "DRAFT" => Draft,
            _ => Active
        };
    }

    public static bool IsDraft(string status) =>
        Normalize(status) == Draft;

    public static bool IsActive(string status) =>
        Normalize(status) == Active;

    public static bool IsCancelled(string status) =>
        Normalize(status) == Cancelled;

    public static bool IsEnded(string status) =>
        Normalize(status) == Ended;

    public static bool HasEnded(string endTime)
    {
        if (string.IsNullOrWhiteSpace(endTime))
        {
            return false;
        }

        var parsed = TryParseToUtc(endTime);
        return parsed.HasValue && parsed.Value < DateTime.UtcNow;
    }

    private static DateTime? TryParseToUtc(string value)
    {
        if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal | DateTimeStyles.AdjustToUniversal, out var parsed))
        {
            return parsed;
        }

        if (DateTime.TryParse(value, CultureInfo.CurrentCulture, DateTimeStyles.AssumeLocal | DateTimeStyles.AdjustToUniversal, out parsed))
        {
            return parsed;
        }

        return null;
    }

    public static EventResponseDto ApplyEffectiveStatus(EventResponseDto evt)
    {
        evt.Status = Normalize(evt.Status);

        if (IsActive(evt.Status) && HasEnded(evt.EndTime))
        {
            evt.Status = Ended;
        }

        return evt;
    }

    public static bool IsPublicVisible(EventResponseDto evt) =>
        evt.IsVisible &&
        IsActive(evt.Status);

    public static bool IsPublicDetailVisible(EventResponseDto evt) =>
        evt.IsVisible &&
        !IsDraft(evt.Status);
}
