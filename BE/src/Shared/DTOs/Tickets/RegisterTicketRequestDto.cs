namespace EventManagement.Shared.DTOs.Tickets
{
    public class RegisterTicketRequestDto
    {
        // Thực tế có thể lấy EventId trực tiếp trên URL path: /events/{eventId}/register
        // Nhưng khai báo DTO này để bọc các metadata mở rộng sau này nếu có (ví dụ: Ghi chú cho BTC)
        public string Note { get; set; } = string.Empty; 
    }
}