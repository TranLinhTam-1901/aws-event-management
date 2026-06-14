namespace EventManagement.Shared.DTOs.Users
{
    public class UserListItemDto
    {
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Organization { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
