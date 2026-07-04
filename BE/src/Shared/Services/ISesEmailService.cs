namespace EventManagement.Shared.Services;

public interface ISesEmailService
{
    Task<(bool Success, string? ErrorMessage)> SendEmailAsync(
        string toEmail,
        string subject,
        string htmlBody);
}