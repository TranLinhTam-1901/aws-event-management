namespace EventManagement.Shared.DTOs.Common
{
    public class ErrorResponseDto
    {
        public string Code { get; set; }
        public string Message { get; set; }
        public Dictionary<string, string[]> Errors { get; set; }
    }
}
