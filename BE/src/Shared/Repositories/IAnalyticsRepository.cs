using EventManagement.Shared.DTOs.Analytics;

namespace EventManagement.Shared.Repositories;

public interface IAnalyticsRepository
{
    Task<int> CountEventsAsync();
    Task<(int Total, int Confirmed, int Waiting)> GetRegistrationStatsAsync();
    Task<int> CountAttendanceAsync();
    Task<int> CountCertificatesIssuedAsync();
    Task<(int Sent, int Failed)> GetNotificationStatsAsync();
    Task<EventAnalyticsDto> GetEventAnalyticsAsync(string eventId, string eventTitle);
}