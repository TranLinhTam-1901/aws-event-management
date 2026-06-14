using EventManagement.Shared.Models;

namespace EventManagement.Shared.Repositories.Interfaces
{
    public interface IAttendanceRepository
    {
        Task<AttendanceItem> GetByTicketAsync(string ticketId);
        Task<List<AttendanceItem>> GetByEventAsync(string eventId);
        Task CreateAsync(AttendanceItem item);
        Task UpdateAsync(AttendanceItem item);
    }
}
