using Amazon.DynamoDBv2.Model;
using EventManagement.Shared.Constants;
using EventManagement.Shared.DTOs.Tickets;
using EventManagement.Shared.DTOs.Events;

namespace EventManagement.Shared.Mappers
{
    public static class TicketDynamoMapper
    {
        public static EventResponseDto ToEventDto(Dictionary<string, AttributeValue> item)
        {
            if (item == null || item.Count == 0) return null!;

            return new EventResponseDto
            {
                EventId = item.TryGetValue(EventFields.EventId, out var id) ? id.S : string.Empty,
                Title = item.TryGetValue(EventFields.Title, out var title) ? title.S : string.Empty,
                Description = item.TryGetValue(EventFields.Description, out var desc) ? desc.S : string.Empty,
                Location = item.TryGetValue(EventFields.Location, out var loc) ? loc.S : string.Empty,
                StartTime = item.TryGetValue(EventFields.StartTime, out var sTime) ? sTime.S : string.Empty,
                EndTime = item.TryGetValue(EventFields.EndTime, out var eTime) ? eTime.S : string.Empty,
                Status = item.TryGetValue(EventFields.Status, out var status) ? status.S : "ACTIVE",
                BannerUrl = item.TryGetValue(EventFields.BannerUrl, out var url) ? url.S : string.Empty,
                Category = item.TryGetValue(EventFields.Category, out var cat) ? cat.S : string.Empty,
                SpeakerName = item.TryGetValue(EventFields.SpeakerName, out var speaker) ? speaker.S : string.Empty,
                Prerequisites = item.TryGetValue(EventFields.Prerequisites, out var pre) ? pre.S : string.Empty,
                RequiredTools = item.TryGetValue(EventFields.RequiredTools, out var tools) ? tools.S : string.Empty,
                MaxSlots = item.TryGetValue(EventFields.MaxSlots, out var max) && int.TryParse(max.N, out var m) ? m : 0,
                RegisteredCount = item.TryGetValue(EventFields.RegisteredCount, out var reg) && int.TryParse(reg.N, out var r) ? r : 0
            };
        }

        public static TicketResponseDto ToTicketDto(Dictionary<string, AttributeValue> item)
        {
            if (item == null || item.Count == 0) return null!;

            return new TicketResponseDto
            {
                TicketId = item.TryGetValue(TicketFields.TicketId, out var tId) ? tId.S : string.Empty,
                EventId = item.TryGetValue(TicketFields.EventId, out var eId) ? eId.S : string.Empty,
                UserId = item.TryGetValue(TicketFields.UserId, out var uId) ? uId.S : string.Empty,
                EventTitle = item.TryGetValue(TicketFields.EventTitle, out var title) ? title.S : string.Empty,
                EventStartTime = item.TryGetValue(TicketFields.EventStartTime, out var sTime) ? sTime.S : string.Empty,
                EventLocation = item.TryGetValue(TicketFields.EventLocation, out var loc) ? loc.S : string.Empty,
                EventCategory = item.TryGetValue(TicketFields.EventCategory, out var cat) ? cat.S : string.Empty,
                UserEmail = item.TryGetValue(TicketFields.UserEmail, out var email) ? email.S : string.Empty,
                UserFullName = item.TryGetValue(TicketFields.UserFullName, out var name) ? name.S : string.Empty,
                Status = item.TryGetValue(TicketFields.Status, out var status) ? status.S : "CONFIRMED",
                CreatedAt = item.TryGetValue(TicketFields.CreatedAt, out var cAt) ? cAt.S : string.Empty
            };
        }

        public static Dictionary<string, AttributeValue> ToDynamoItem(TicketResponseDto dto)
        {
            return new Dictionary<string, AttributeValue>
            {
                [TicketFields.TicketId] = new AttributeValue { S = dto.TicketId },
                [TicketFields.EventId] = new AttributeValue { S = dto.EventId },
                [TicketFields.UserId] = new AttributeValue { S = dto.UserId },
                [TicketFields.EventTitle] = new AttributeValue { S = dto.EventTitle },
                [TicketFields.EventStartTime] = new AttributeValue { S = dto.EventStartTime },
                [TicketFields.EventLocation] = new AttributeValue { S = dto.EventLocation },
                [TicketFields.EventCategory] = new AttributeValue { S = dto.EventCategory },
                [TicketFields.UserEmail] = new AttributeValue { S = dto.UserEmail },
                [TicketFields.UserFullName] = new AttributeValue { S = dto.UserFullName },
                [TicketFields.Status] = new AttributeValue { S = dto.Status },
                [TicketFields.CreatedAt] = new AttributeValue { S = dto.CreatedAt }
            };
        }
    }
}