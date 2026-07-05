namespace EventManagement.Shared.Services;

public static class EmailTemplateBuilder
{
    public static (string Subject, string Body) BuildRegistrationConfirmed(
        string fullName, string eventTitle, string startTime, string location)
    {
        var subject = $"Xác nhận đăng ký thành công: {eventTitle}";
        var body = $@"
            <h2>Xin chào {fullName},</h2>
            <p>Bạn đã đăng ký thành công sự kiện <b>{eventTitle}</b>.</p>
            <p><b>Thời gian:</b> {startTime}</p>
            <p><b>Địa điểm:</b> {location}</p>
            <p>Vui lòng giữ email này để làm bằng chứng đăng ký.</p>";
        return (subject, body);
    }

    public static (string Subject, string Body) BuildWaitingList(
        string fullName, string eventTitle)
    {
        var subject = $"Bạn đang trong danh sách chờ: {eventTitle}";
        var body = $@"
            <h2>Xin chào {fullName},</h2>
            <p>Sự kiện <b>{eventTitle}</b> hiện đã đủ số lượng đăng ký.</p>
            <p>Bạn đang ở danh sách chờ, chúng tôi sẽ thông báo nếu có chỗ trống.</p>";
        return (subject, body);
    }

    public static (string Subject, string Body) BuildEventReminder(
        string fullName, string eventTitle, string startTime, string location)
    {
        var subject = $"Nhắc lịch: {eventTitle} sắp diễn ra";
        var body = $@"
            <h2>Xin chào {fullName},</h2>
            <p>Sự kiện <b>{eventTitle}</b> bạn đã đăng ký sắp diễn ra.</p>
            <p><b>Thời gian:</b> {startTime}</p>
            <p><b>Địa điểm:</b> {location}</p>
            <p>Hẹn gặp bạn tại sự kiện!</p>";
        return (subject, body);
    }
}