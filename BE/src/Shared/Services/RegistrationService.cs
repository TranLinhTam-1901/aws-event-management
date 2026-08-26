// using EventManagement.Shared.DTOs.Registrations;
// using EventManagement.Shared.DTOs.Tickets;
// using EventManagement.Shared.Helpers;
// using EventManagement.Shared.Models;
// using EventManagement.Shared.Models.Enums;
// using EventManagement.Shared.Repositories;

// namespace EventManagement.Shared.Services;

// public class RegistrationService : IRegistrationService
// {
//     private readonly IEventRepository _eventRepository;
//     private readonly ITicketRepository _ticketRepository;

//     public RegistrationService(
//         IEventRepository eventRepository,
//         ITicketRepository ticketRepository)
//     {
//         _eventRepository = eventRepository;
//         _ticketRepository = ticketRepository;
//     }

//     public async Task<RegisterEventResponseDto> RegisterForEventAsync(
//         string eventId,
//         string userId,
//         RegisterEventRequestDto request)
//     {
//         if (string.IsNullOrWhiteSpace(request.FullName) ||
//             string.IsNullOrWhiteSpace(request.Email))
//         {
//             throw new Exception("Full name and email are required.");
//         }

//         var eventItem = await _eventRepository.GetByIdAsync(eventId);

//         if (eventItem == null)
//         {
//             throw new Exception("Event not found.");
//         }

//         var effective = EventStatusHelper.ApplyEffectiveStatus(eventItem);

//         if (!EventStatusHelper.IsPublicDetailVisible(effective))
//         {
//             throw new Exception("Event is not available for registration.");
//         }

//         if (!EventStatusHelper.IsActive(effective.Status))
//         {
//             throw new Exception("Registration is closed for this event.");
//         }

//         if (EventStatusHelper.HasEnded(effective.EndTime))
//         {
//             throw new Exception("This event has already ended.");
//         }

//         if (await _ticketRepository.HasTicketForEventAsync(userId, eventId))
//         {
//             throw new AlreadyRegisteredException("Bạn đã đăng ký sự kiện này rồi.");
//         }

//         if (effective.RegisteredCount >= effective.MaxSlots)
//         {
//             throw new EventFullException("Sự kiện đã hết slot đăng ký.");
//         }

//         if (!await _eventRepository.TryIncrementRegisteredCountAsync(eventId))
//         {
//             throw new EventFullException("Sự kiện đã hết slot đăng ký.");
//         }

//         var ticketId = Guid.NewGuid().ToString();

//         try
//         {
//             await _ticketRepository.CreateAsync(new TicketItem
//             {
//                 TicketId = ticketId,
//                 RegistrationId = ticketId,
//                 EventId = eventId,
//                 UserId = userId,
//                 FullName = request.FullName.Trim(),
//                 Email = request.Email.Trim(),
//                 Phone = request.Phone?.Trim() ?? string.Empty,
//                 Status = TicketStatus.Confirmed,
//                 CreatedAt = DateTime.UtcNow
//             });
//         }
//         catch
//         {
//             await _eventRepository.TryDecrementRegisteredCountAsync(eventId);
//             throw;
//         }

//         return new RegisterEventResponseDto
//         {
//             RegistrationId = ticketId,
//             TicketId = ticketId,
//             Status = TicketStatus.Confirmed.ToString(),
//             Message = "Registration successful."
//         };
//     }

//     public async Task<List<TicketListItemDto>> GetMyTicketsAsync(string userId)
//     {
//         var tickets = await _ticketRepository.GetByUserIdAsync(userId);

//         return tickets.Select(t => new TicketListItemDto
//         {
//             TicketId = t.TicketId,
//             EventId = t.EventId,
//             RegistrationId = t.RegistrationId,
//             FullName = t.FullName,
//             Email = t.Email,
//             Phone = t.Phone,
//             Status = t.Status.ToString(),
//             CreatedAt = t.CreatedAt.ToString("O")
//         }).ToList();
//     }
// }

// public class EventFullException : Exception
// {
//     public EventFullException(string message) : base(message)
//     {
//     }
// }

// public class AlreadyRegisteredException : Exception
// {
//     public AlreadyRegisteredException(string message) : base(message)
//     {
//     }
// }
