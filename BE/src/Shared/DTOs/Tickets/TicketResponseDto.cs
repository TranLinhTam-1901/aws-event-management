namespace EventManagement.Shared.DTOs.Tickets
{
    public class TicketResponseDto
    {
        public string TicketId { get; set; } = string.Empty; // FE dùng chuỗi này encode thành QR Code
        public string EventId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;

        // Thông tin sự kiện (Snapshot phẳng)
        public string EventTitle { get; set; } = string.Empty;
        public string EventStartTime { get; set; } = string.Empty;
        public string EventLocation { get; set; } = string.Empty;
        public string EventCategory { get; set; } = string.Empty;

        // Thông tin chủ sở hữu vé
        public string UserEmail { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;

        // Trạng thái tự động duyệt
        public string Status { get; set; } = "CONFIRMED";
        public string CreatedAt { get; set; } = string.Empty;
    }
}