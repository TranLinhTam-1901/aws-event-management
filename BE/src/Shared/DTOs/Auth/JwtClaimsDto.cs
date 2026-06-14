namespace EventManagement.Shared.DTOs.Auth
{
    public class JwtClaimsDto
    {
        public string Sub { get; set; }
        public string Email { get; set; }
        public string CognitoUsername { get; set; }
        public List<string> Groups { get; set; }
        public long IssuedAt { get; set; }
        public long ExpiresAt { get; set; }
    }
}
