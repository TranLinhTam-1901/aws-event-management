namespace EventManagement.Shared.Services.Interfaces
{
    public interface ISesEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, string plainTextBody = null);
        Task<bool> SendTemplatedEmailAsync(string toEmail, string templateName, Dictionary<string, string> templateData);
        Task<List<string>> GetVerifiedEmailsAsync();
    }
}
