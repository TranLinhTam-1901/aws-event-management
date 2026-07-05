using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.S3;
using Amazon.S3.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Analytics;

namespace EventManagement.Shared.Repositories
{
    public class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly IAmazonDynamoDB _dynamoDb;
        private readonly IAmazonS3 _s3Client;
        private readonly string _eventTableName;
        private readonly string _ticketTableName;
        private readonly string _attendanceTableName;
        private readonly string _notificationLogTableName;
        private readonly string _certificateBucketName;

        public AnalyticsRepository(
            IAmazonDynamoDB dynamoDb,
            IAmazonS3 s3Client,
            string eventTableName,
            string ticketTableName,
            string attendanceTableName,
            string notificationLogTableName,
            string certificateBucketName)
        {
            _dynamoDb = dynamoDb;
            _s3Client = s3Client;
            _eventTableName = eventTableName;
            _ticketTableName = ticketTableName;
            _attendanceTableName = attendanceTableName;
            _notificationLogTableName = notificationLogTableName;
            _certificateBucketName = certificateBucketName;
        }

        public async Task<int> CountEventsAsync()
        {
            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _eventTableName,
                Select = "COUNT"
            });
            return response.Count ?? 0;
        }

        /// <summary>
        /// Scan toàn bảng Ticket, chỉ lấy field Status (ProjectionExpression) để nhẹ hơn,
        /// tự phân loại: WAITING riêng, CANCELLED không tính, còn lại coi là "đã xác nhận"
        /// (bao gồm CONFIRMED/SUCCESS/PENDING/PENDING_CHECKIN/CHECKED_IN).
        /// </summary>
        public async Task<(int Total, int Confirmed, int Waiting)> GetRegistrationStatsAsync()
        {
            int total = 0, confirmed = 0, waiting = 0;

            var request = new ScanRequest
            {
                TableName = _ticketTableName,
                ProjectionExpression = "#s",
                ExpressionAttributeNames = new Dictionary<string, string> { ["#s"] = TicketFields.Status }
            };

            Dictionary<string, AttributeValue>? lastKey = null;
            do
            {
                request.ExclusiveStartKey = lastKey;
                var response = await _dynamoDb.ScanAsync(request);

                foreach (var item in response.Items)
                {
                    total++;
                    var status = item.TryGetValue(TicketFields.Status, out var s) ? s.S : string.Empty;

                    if (string.Equals(status, "WAITING", StringComparison.OrdinalIgnoreCase))
                        waiting++;
                    else if (!string.Equals(status, "CANCELLED", StringComparison.OrdinalIgnoreCase))
                        confirmed++;
                }

                lastKey = response.LastEvaluatedKey?.Count > 0 ? response.LastEvaluatedKey : null;
            } while (lastKey != null);

            return (total, confirmed, waiting);
        }

        public async Task<int> CountAttendanceAsync()
        {
            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _attendanceTableName,
                Select = "COUNT"
            });
            return response.Count ?? 0;
        }

        /// <summary>
        /// Đếm chính xác số file PDF chứng chỉ thật trong S3, theo prefix "certificates/"
        /// khớp đúng key mà AttendanceCertificateLambda dùng khi PutObject.
        /// </summary>
        public async Task<int> CountCertificatesIssuedAsync()
        {
            int count = 0;
            string? continuationToken = null;

            do
            {
                var response = await _s3Client.ListObjectsV2Async(new ListObjectsV2Request
                {
                    BucketName = _certificateBucketName,
                    Prefix = "certificates/",
                    ContinuationToken = continuationToken
                });

                count += response.S3Objects.Count;
                continuationToken = response.IsTruncated == true ? response.NextContinuationToken : null;
            } while (continuationToken != null);

            return count;
        }

        public async Task<(int Sent, int Failed)> GetNotificationStatsAsync()
        {
            int sent = 0, failed = 0;

            var request = new ScanRequest
            {
                TableName = _notificationLogTableName,
                ProjectionExpression = "#s",
                ExpressionAttributeNames = new Dictionary<string, string> { ["#s"] = NotificationFields.Status }
            };

            Dictionary<string, AttributeValue>? lastKey = null;
            do
            {
                request.ExclusiveStartKey = lastKey;
                var response = await _dynamoDb.ScanAsync(request);

                foreach (var item in response.Items)
                {
                    var status = item.TryGetValue(NotificationFields.Status, out var s) ? s.S : string.Empty;
                    if (string.Equals(status, "Sent", StringComparison.OrdinalIgnoreCase)) sent++;
                    else if (string.Equals(status, "Failed", StringComparison.OrdinalIgnoreCase)) failed++;
                }

                lastKey = response.LastEvaluatedKey?.Count > 0 ? response.LastEvaluatedKey : null;
            } while (lastKey != null);

            return (sent, failed);
        }

        /// <summary>
        /// Thống kê riêng cho 1 sự kiện: dùng Query (không Scan) vì Attendance có EventId là Partition Key,
        /// hiệu quả hơn nhiều so với Scan toàn bảng.
        /// </summary>
        public async Task<EventAnalyticsDto> GetEventAnalyticsAsync(string eventId, string eventTitle)
        {
            var ticketResponse = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _ticketTableName,
                FilterExpression = "#eid = :eid",
                ExpressionAttributeNames = new Dictionary<string, string> { ["#eid"] = TicketFields.EventId },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue> { [":eid"] = new AttributeValue { S = eventId } }
            });

            int total = 0, confirmed = 0, waiting = 0;
            foreach (var item in ticketResponse.Items)
            {
                total++;
                var status = item.TryGetValue(TicketFields.Status, out var s) ? s.S : string.Empty;
                if (string.Equals(status, "WAITING", StringComparison.OrdinalIgnoreCase)) waiting++;
                else if (!string.Equals(status, "CANCELLED", StringComparison.OrdinalIgnoreCase)) confirmed++;
            }

            var attendanceResponse = await _dynamoDb.QueryAsync(new QueryRequest
            {
                TableName = _attendanceTableName,
                KeyConditionExpression = "#eid = :eid",
                ExpressionAttributeNames = new Dictionary<string, string> { ["#eid"] = AttendanceFields.EventId },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue> { [":eid"] = new AttributeValue { S = eventId } }
            });

            int checkInCount = attendanceResponse.Count ?? 0;
            double attendanceRate = confirmed > 0
                ? Math.Round((double)checkInCount / confirmed * 100, 1)
                : 0;

            return new EventAnalyticsDto
            {
                EventId = eventId,
                EventTitle = eventTitle,
                TotalRegistrations = total,
                ConfirmedCount = confirmed,
                WaitingCount = waiting,
                CheckInCount = checkInCount,
                AttendanceRate = attendanceRate
            };
        }
    }
}