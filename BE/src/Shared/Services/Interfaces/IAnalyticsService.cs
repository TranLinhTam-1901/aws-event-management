using EventManagement.Shared.DTOs.Analytics;

namespace EventManagement.Shared.Services.Interfaces
{
    public interface IAnalyticsService
    {
        Task<DashboardOverviewDto> GetDashboardOverviewAsync();
        Task<EventAnalyticsDto> GetEventAnalyticsAsync(string eventId);
        Task<List<EventAnalyticsDto>> GetAllEventAnalyticsAsync();
        Task<RegistrationStatsDto> GetRegistrationStatsAsync(string eventId);
        Task<AttendanceStatsDto> GetAttendanceStatsAsync(string eventId);
        Task<NotificationStatsDto> GetNotificationStatsAsync();
    }
}
