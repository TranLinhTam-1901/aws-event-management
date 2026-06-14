namespace EventManagement.Shared.Services.Interfaces
{
    public interface IS3StorageService
    {
        Task<string> UploadFileAsync(string key, string filePath);
        Task<string> UploadBytesAsync(string key, byte[] fileBytes, string contentType);
        Task<byte[]> DownloadFileAsync(string key);
        Task DeleteFileAsync(string key);
        Task<string> GetPresignedUrlAsync(string key, int expirationMinutes = 60);
    }
}
