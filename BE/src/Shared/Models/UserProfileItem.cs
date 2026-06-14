using EventManagement.Shared.Models.Enums;

namespace EventManagement.Shared.Models
{
    public class UserProfileItem
    {
        public string UserId { get; set; }
        public string CognitoSub { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Organization { get; set; }
        public UserRole Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
