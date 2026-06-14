namespace EventManagement.Shared.Services.Interfaces
{
    public interface IEventBridgeSchedulerService
    {
        Task<string> CreateScheduleAsync(string scheduleName, DateTime scheduleTime, string targetLambdaArn, object payload);
        Task UpdateScheduleAsync(string scheduleName, DateTime newScheduleTime, object payload);
        Task DeleteScheduleAsync(string scheduleName);
    }
}
