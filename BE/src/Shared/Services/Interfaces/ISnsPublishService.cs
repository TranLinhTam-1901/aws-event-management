namespace EventManagement.Shared.Services.Interfaces
{
    public interface ISnsPublishService
    {
        Task<string> PublishMessageAsync(string topicArn, string subject, string message);
        Task<string> PublishMessageAsync(string topicArn, object messageObject);
    }
}
