using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Events;
using EventManagement.Shared.DTOs.Notifications;
using EventManagement.Shared.DTOs.Tickets;
using EventManagement.Shared.Mappers;

namespace EventManagement.Shared.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly IAmazonDynamoDB _dynamoDb;
        private readonly string _notificationLogTableName;
        private readonly string _eventTableName;
        private readonly string _ticketTableName;

        public NotificationRepository(
            IAmazonDynamoDB dynamoDb,
            string notificationLogTableName,
            string eventTableName,
            string ticketTableName)
        {
            _dynamoDb = dynamoDb;
            _notificationLogTableName = notificationLogTableName;
            _eventTableName = eventTableName;
            _ticketTableName = ticketTableName;
        }

        public async Task LogNotificationAsync(NotificationLogDto log)
        {
            await _dynamoDb.PutItemAsync(new PutItemRequest
            {
                TableName = _notificationLogTableName,
                Item = NotificationLogDynamoMapper.ToDynamoItem(log)
            });
        }

        public async Task<List<NotificationLogDto>> GetAllLogsAsync()
        {
            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _notificationLogTableName
            });

            return response.Items
                .Select(NotificationLogDynamoMapper.FromDynamoItem)
                .OrderByDescending(x => x.SentAt)
                .ToList();
        }

        /// <summary>
        /// Quét các Event có StartTime nằm trong khoảng [fromTime, toTime].
        /// Dùng cho Schedule chạy mỗi giờ để tìm sự kiện cần gửi email nhắc.
        /// </summary>
        public async Task<List<EventResponseDto>> GetUpcomingEventsAsync(DateTime fromTime, DateTime toTime)
        {
            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _eventTableName,
                FilterExpression = "#status = :active AND #start BETWEEN :from AND :to",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#status"] = EventFields.Status,
                    ["#start"] = EventFields.StartTime
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":active"] = new AttributeValue { S = "Active" },
                    [":from"] = new AttributeValue { S = fromTime.ToString("O") },
                    [":to"] = new AttributeValue { S = toTime.ToString("O") }
                }
            });

            return response.Items.Select(EventDynamoMapper.FromDynamoItem).ToList();
        }

        /// <summary>
        /// Scan toàn bảng Ticket lọc theo EventId + Status Confirmed.
        /// Chấp nhận Scan (không hiệu quả bằng Query) vì Ticket table không có GSI theo EventId,
        /// phù hợp quy mô đồ án. Nếu dữ liệu lớn, cần bổ sung GSI EventTicketsIndex.
        /// </summary>
        public async Task<List<TicketResponseDto>> GetConfirmedTicketsByEventIdAsync(string eventId)
        {
            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _ticketTableName,
                FilterExpression = "#eventId = :eventId AND #status = :confirmed",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#eventId"] = TicketFields.EventId,
                    ["#status"] = TicketFields.Status
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":eventId"] = new AttributeValue { S = eventId },
                    [":confirmed"] = new AttributeValue { S = "CONFIRMED" }
                }
            });

            return response.Items.Select(TicketDynamoMapper.ToTicketDto).ToList();
        }
    }
}