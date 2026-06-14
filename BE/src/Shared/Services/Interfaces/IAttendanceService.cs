using EventManagement.Shared.DTOs.Attendance;

namespace EventManagement.Shared.Services.Interfaces
{
    public interface IAttendanceService
    {
        Task<CheckInResponseDto> CheckInAsync(CheckInRequestDto dto, string checkedBy);
        Task<List<AttendanceListItemDto>> GetAttendanceByEventAsync(string eventId);
        Task<AttendanceDto> GetAttendanceByTicketAsync(string ticketId);
    }
}
