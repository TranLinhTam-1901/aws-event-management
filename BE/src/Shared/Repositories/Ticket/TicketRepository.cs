using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Tickets;
using EventManagement.Shared.DTOs.Events;
using EventManagement.Shared.Mappers;

namespace EventManagement.Shared.Repositories
{
    public class TicketRepository : ITicketRepository
    {
        private readonly IAmazonDynamoDB _dynamoDb;
        private readonly string _ticketTableName;
        private readonly string _eventTableName;

        public TicketRepository(IAmazonDynamoDB dynamoDb, string ticketTableName, string eventTableName)
        {
            _dynamoDb = dynamoDb;
            _ticketTableName = ticketTableName;
            _eventTableName = eventTableName;
        }

        public async Task<EventResponseDto?> GetEventByIdAsync(string eventId)
        {
            var response = await _dynamoDb.GetItemAsync(new GetItemRequest
            {
                TableName = _eventTableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [EventFields.EventId] = new AttributeValue { S = eventId }
                }
            });

            if (response.Item == null || response.Item.Count == 0) return null;

            return TicketDynamoMapper.ToEventDto(response.Item);
        }

        /// <summary>
        /// Tăng số lượng người đăng ký lên 1 một cách nguyên tử (Atomic Increment)
        /// Chặn Overbooking bằng cách kiểm tra: RegisteredCount < MaxSlots
        /// </summary>
        public async Task UpdateEventIncrementRegisteredCountAsync(string eventId)
        {
            await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
            {
                TableName = _eventTableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [EventFields.EventId] = new AttributeValue { S = eventId }
                },
                UpdateExpression = "SET #regCount = #regCount + :inc",
                ConditionExpression = "#regCount < #maxSlots",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#regCount"] = EventFields.RegisteredCount,
                    ["#maxSlots"] = EventFields.MaxSlots
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":inc"] = new AttributeValue { N = "1" }
                }
            });
        }

        public async Task CreateTicketAsync(TicketResponseDto ticketDto)
        {
            await _dynamoDb.PutItemAsync(new PutItemRequest
            {
                TableName = _ticketTableName,
                Item = TicketDynamoMapper.ToDynamoItem(ticketDto)
            });
        }

        /// <summary>
        /// Lấy danh sách vé đã đặt của User dựa vào Global Secondary Index (UserTicketsIndex)
        /// </summary>
        public async Task<List<TicketResponseDto>> GetTicketsByUserIdAsync(string userId)
        {
            var result = new List<TicketResponseDto>();

            var response = await _dynamoDb.QueryAsync(new QueryRequest
            {
                TableName = _ticketTableName,
                IndexName = "UserTicketsIndex", // Tên GSI thiết lập trên DynamoDB
                KeyConditionExpression = "#userId = :userId",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#userId"] = TicketFields.UserId
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":userId"] = new AttributeValue { S = userId }
                }
            });

            if (response.Items != null && response.Items.Count > 0)
            {
                foreach (var item in response.Items)
                {
                    result.Add(TicketDynamoMapper.ToTicketDto(item));
                }
            }

            return result;
        }
    }
}