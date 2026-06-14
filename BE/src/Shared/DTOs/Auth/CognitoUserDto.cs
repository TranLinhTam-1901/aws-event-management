namespace EventManagement.Shared.DTOs.Auth
{
    public class CognitoUserDto
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string GivenName { get; set; }
        public string FamilyName { get; set; }
    }
}
