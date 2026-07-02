using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.DTOs.Tickets;
using EventManagement.Shared.Helpers;
using EventManagement.Shared.Repositories;

namespace EventManagement.Shared.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _ticketRepository;

        public TicketService(ITicketRepository ticketRepository)
        {
            _ticketRepository = ticketRepository;
        }

        public async Task<TicketResponseDto> RegisterTicketAsync(string eventId, string userId, string userEmail, string userFullName)
        {
            // logic tránh đăng ký 1 sự kiện nhiều lần cho 1 tài khoản
            var userTickets = await _ticketRepository.GetTicketsByUserIdAsync(userId);
            if (userTickets != null && userTickets.Any(t => t.EventId == eventId))
            {
                // Ném lỗi trực tiếp, Lambda Handler sẽ bắt được và trả về 400 BadRequest lên FE
                throw new InvalidOperationException("Bạn đã đăng ký vé cho sự kiện này rồi! Không thể đăng ký thêm.");
            }


            // 1. Lấy thông tin Event thô dạng DTO từ Repo để kiểm tra
            var eventDto = await _ticketRepository.GetEventByIdAsync(eventId);
            if (eventDto == null)
            {
                throw new KeyNotFoundException("Sự kiện không tồn tại trên hệ thống!");
            }

            if (!EventStatusHelper.IsActive(eventDto.Status))
            {
                throw new InvalidOperationException("Sự kiện này hiện không mở đăng ký!");
            }

            if (EventStatusHelper.HasEnded(eventDto.EndTime))
            {
                throw new InvalidOperationException("Sự kiện đã kết thúc, không thể đăng ký thêm!");
            }

            try
            {
                // 2. Thực hiện cập nhật số lượng đăng ký có điều kiện nguyên tử trên DynamoDB
                await _ticketRepository.UpdateEventIncrementRegisteredCountAsync(eventId);
            }
            catch (ConditionalCheckFailedException)
            {
                // Ngoại lệ ném ra khi điều kiện (RegisteredCount < MaxSlots) bị vi phạm
                throw new InvalidOperationException("Sự kiện này đã đạt giới hạn số lượng chỗ ngồi (Hết vé)!");
            }

            // 3. Tạo dữ liệu Vé phẳng Snapshot trực tiếp từ thông tin Event và thông tin User định danh từ Token
            var ticketDto = new TicketResponseDto
            {
                TicketId = Guid.NewGuid().ToString("N"), // Chuỗi ID viết liền tạo QR Code gọn đẹp
                EventId = eventDto.EventId,
                UserId = userId,
                EventTitle = eventDto.Title,
                EventStartTime = eventDto.StartTime,
                EventLocation = eventDto.Location,
                EventCategory = eventDto.Category,
                UserEmail = userEmail,
                UserFullName = userFullName,
                Status = "CONFIRMED", // Định hướng tự động duyệt ngay lập tức
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") // ISO 8601 chuẩn
            };

            // 4. Lưu bản ghi Vé vào bảng TicketTable
            await _ticketRepository.CreateTicketAsync(ticketDto);

            // 5. Trả về DTO kết quả sạch sẽ (Sẵn sàng để Lambda Handler kích hoạt thông báo SNS hoặc phản hồi API)
            return ticketDto;
        }

        public async Task<List<TicketResponseDto>> GetUserTicketsAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return new List<TicketResponseDto>();
            }

            return await _ticketRepository.GetTicketsByUserIdAsync(userId);
        }
    }
}