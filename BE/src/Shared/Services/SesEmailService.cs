using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;

namespace EventManagement.Shared.Services;

public class SesEmailService : ISesEmailService
{
    private readonly IAmazonSimpleEmailService _sesClient;
    private readonly string _fromEmail;

    public SesEmailService(IAmazonSimpleEmailService sesClient, string fromEmail)
    {
        _sesClient = sesClient;
        _fromEmail = fromEmail;
    }

    public async Task<(bool Success, string? ErrorMessage)> SendEmailAsync(
        string toEmail,
        string subject,
        string htmlBody)
    {
        try
        {
            var request = new SendEmailRequest
            {
                Source = _fromEmail,
                Destination = new Destination { ToAddresses = new List<string> { toEmail } },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body { Html = new Content { Charset = "UTF-8", Data = htmlBody } }
                }
            };

            await _sesClient.SendEmailAsync(request);
            return (true, null);
        }
        catch (Exception ex)
        {
            // Không throw, để Function.cs quyết định có ghi log Failed hay không,
            // tránh Lambda bị retry vô hạn vì 1 email lỗi.
            return (false, ex.Message);
        }
    }
}